import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class APILoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = request.user if request.user.is_authenticated else None
        response = self.get_response(request)

        logger.info({
            'path': request.path,
            'method': request.method,
            'user': user.username if user else 'Anonymous',
            'role': getattr(user.profile, 'role', None) if user else None,
            'status_code': response.status_code,
            'timestamp': datetime.now().isoformat()
        })

        return response