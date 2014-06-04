from django.conf.urls.defaults import *
from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
admin.autodiscover()
import mangement.views
import settings
handler500 = 'djangotoolbox.errorviews.server_error'

urlpatterns = patterns('',
    url (r'^$', mangement.views.IndexView.as_view()),

)



