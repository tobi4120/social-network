from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import *
from rest_framework import viewsets, authentication, permissions
from .serializers import *

# Render the models to JSON format
class PostViewSet(viewsets.ModelViewSet):
    queryset = post.objects.all().order_by('-creation_date')
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LikeViewSet(viewsets.ModelViewSet):
    queryset = like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(account=self.request.user)

def index(request):
    return render(request, "network/index.html", {
        "current_user": request.user.username
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def profile(request, profile_name):

    # Get the profile from the id in the URL
    profile = User.objects.filter(username=profile_name)

    # If the user enters an invalid ID in the URL, redirect back to homepage
    if not profile:
        return redirect(index)

    # Get the people that follow the page
    followers = following.objects.filter(following__in=profile)
    
    # Get the people the page follows
    people_following = following.objects.filter(follower__in=profile)

    # Get the people the current user follows
    current_user_following = following.objects.filter(follower__in=User.objects.filter(username=request.user.username))

    # See if the current user is following the page
    follow_button = "Follow"

    # Create unfollow button if user already follows
    for user in current_user_following:
        if user.following.username == profile_name:
            follow_button = "Unfollow"
    
    return render(request, "network/profile.html", {
        "profile": profile_name,
        "followers": followers.count(),
        "following": people_following.count(),
        "follow_button": follow_button,
        "current_user": request.user.username
    })

def follow_unfollow(request):
    if request.method == "POST":

        # Get the profile the user wishes to follow/unfollow
        profile = User.objects.get(username=request.POST['profile'])

        # Follow profile
        if request.POST['type'] == "Follow":
            f = following(follower=request.user, following=profile)
            f.save()
        
        # Unfollow profile
        else:
            f = following.objects.filter(follower=request.user, following=profile).delete()
        
        return redirect(f"profile/{profile.username}")

    return redirect(index)

@login_required(login_url='/login')
def following_page(request):

    # Get the names that the user follows 
    following_names = following.objects.filter(follower=request.user)

    following_list = []

    # Store all the names in a list
    for name in following_names:
        following_list.append(name.following.username)

    return render(request, "network/following.html", {
        "following_list": following_list,
        "current_user": request.user
    })