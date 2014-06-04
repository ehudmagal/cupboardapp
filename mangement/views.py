# Corresponding Django view, "django-guestbook/guestbook/views.py"
from django.core.cache import cache
from django.views.generic import TemplateView
from models import Greeting
MEMCACHE_GREETINGS = 'greetings'

class IndexView(TemplateView):
    template_name = "index.html"