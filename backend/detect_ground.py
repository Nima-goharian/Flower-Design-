import cv2
import numpy as np
import sys
import json

def detect_ground(image):
    # Convert to grayscale and blur for edge detection.
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 50, 150)

    # Detect lines using Hough Transform.
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50, minLineLength=50, maxLineGap=10)
    horizon_y = None
    horizontal_lines = []
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Consider nearly horizontal lines (slope near zero).
            if abs(y2 - y1) < 0.2 * abs(x2 - x1):
                horizontal_lines.append((x1, y1, x2, y2))
        if horizontal_lines:
            # Average the y-values of the horizontal lines to estimate the horizon.
            y_vals = [ (line[1] + line[3]) / 2 for line in horizontal_lines ]
            horizon_y = int(sum(y_vals) / len(y_vals))

    # Fallback: if no horizon is found, assume it's at 2/3 of the image height.
    if horizon_y is None:
        horizon_y = int(image.shape[0] * 2 / 3)

    # Define ground as a rectangle covering the full width and from the horizon to the bottom.
    ground_rect = [0, horizon_y, image.shape[1], image.shape[0] - horizon_y]

    # Optionally draw the horizon line (for debugging).
    cv2.line(image, (0, horizon_y), (image.shape[1], horizon_y), (0, 255, 0), 2)
    cv2.imwrite("processed_ground.jpg", image)
    return horizon_y, ground_rect

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image provided"}))
        sys.exit(1)
    image = cv2.imread(sys.argv[1])
    if image is None:
        print(json.dumps({"error": "Failed to read image"}))
        sys.exit(1)
    horizon_y, ground_rect = detect_ground(image)
    result = {"found": True, "horizon": horizon_y, "ground_rect": ground_rect}
    print(json.dumps(result))
