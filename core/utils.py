from django.utils import timezone


def get_current_academic_year():
    """
    Get current academic year based on current date
    """
    now = timezone.now()
    if now.month >= 9:
        return f"{now.year}-{now.year + 1}"
    else:
        return f"{now.year - 1}-{now.year}"


def generate_student_id():
    """
    Generate a human-friendly student identifier.
    """
    return f"STU{timezone.now():%y%m%d%H%M%S}"


def generate_receipt_number(model_cls, prefix='PAY'):
    """
    Generate a unique receipt number for a model with a receipt_number field.
    """
    import random

    date_part = timezone.now().strftime('%Y%m%d')

    while True:
        receipt_number = f"{prefix}-{date_part}-{random.randint(10000, 99999)}"
        if not model_cls.objects.filter(receipt_number=receipt_number).exists():
            return receipt_number
