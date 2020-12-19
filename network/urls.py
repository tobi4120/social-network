
from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'posts', views.PostViewSet)
router.register(r'likes', views.LikeViewSet)

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("api", include(router.urls)),
    path("profile/<str:profile_name>", views.profile, name="profile"),
    path("follow_unfollow", views.follow_unfollow, name="follow_unfollow"),
    path("following", views.following_page, name="following")
]
