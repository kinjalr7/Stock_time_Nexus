from fastapi import APIRouter
from .models import model_metrics, ModelMetric

router = APIRouter()

@router.get("/", response_model=list[ModelMetric])
def get_model_metrics():
    return model_metrics