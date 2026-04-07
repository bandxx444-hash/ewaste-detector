import base64
import io
from PIL import Image


def encode_image(uploaded_file) -> dict:
    """Convert a Streamlit UploadedFile to a Claude API image content block."""
    uploaded_file.seek(0)
    img = Image.open(uploaded_file)
    img.thumbnail((1568, 1568))  # Claude max recommended dimension

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    b64 = base64.standard_b64encode(buf.getvalue()).decode()

    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": b64,
        },
    }


CARBON_SAVINGS_LBS = {
    "smartphone":   44,
    "laptop":       357,
    "desktop":      718,
    "tablet":       86,
    "monitor":      530,
    "printer":      185,
    "television":   1050,
    "keyboard":     22,
    "camera":       55,
    "default":      100,
}


def carbon_saving(device_name: str) -> int:
    """Return approximate lbs of CO2 saved by recycling instead of landfilling."""
    name_lower = device_name.lower()
    for key, value in CARBON_SAVINGS_LBS.items():
        if key in name_lower:
            return value
    return CARBON_SAVINGS_LBS["default"]
