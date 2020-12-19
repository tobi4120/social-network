from .models import *
from rest_framework import serializers

class PostSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.CharField(read_only=True)

    class Meta:
        model = post
        fields = ('id','content', 'creation_date', 'likes', 'user')

class LikeSerializer(serializers.HyperlinkedModelSerializer):
    account = serializers.CharField(read_only=True)
    

    class Meta:
        model = like
        fields = ('id', 'account', 'post')