from django.contrib.auth.models import AbstractUser, User
from django.db import models


class User(AbstractUser):
    pass

class post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=250)
    creation_date = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(null=True)

    def __str__(self):
        return f"{self.id} - '{self.content}'"

class following(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE)
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='%(class)s_following')

    def __str__(self):
        return f"{self.follower} follows {self.following}"

class like(models.Model):
    account = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(post, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.account} likes, post: {self.post}"