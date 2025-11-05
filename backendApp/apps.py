from django.apps import AppConfig


class BackendappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backendApp'
    def ready(self):
        from . import signals # type: ignore  # imported for side effects

