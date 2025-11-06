// Get references to DOM elements
const dropArea = document.getElementById("dropArea");
const imageUpload = document.getElementById("imageUpload");
const fileNameDisplay = document.getElementById("fileName");
const originalImage = document.getElementById("originalImage");
const originalDimensions = document.getElementById("originalDimensions");
const newWidthInput = document.getElementById("newWidth");
const newHeightInput = document.getElementById("newHeight");
const resizeButton = document.getElementById("resizeButton");
const imageCanvas = document.getElementById("imageCanvas");
const downloadLink = document.getElementById("downloadLink");
const imageControls = document.getElementById("imageControls");
const resizedImageSection = document.getElementById("resizedImageSection");
const messageBox = document.getElementById("messageBox");
const socialPresetSelect = document.getElementById("socialPreset"); // New type dropdown

let currentImage = null; // Stores the loaded Banner object

// Define social media types
const socialPresets = {
  fb_profile: { width: 170, height: 170 },
  fb_cover: { width: 820, height: 312 },
  fb_post_square: { width: 1200, height: 1200 },
  fb_post_landscape: { width: 1200, height: 630 },
  ig_profile: { width: 320, height: 320 },
  ig_post_square: { width: 1080, height: 1080 },
  ig_post_portrait: { width: 1080, height: 1350 },
  ig_story: { width: 1080, height: 1920 },
  x_profile: { width: 400, height: 400 },
  x_header: { width: 1500, height: 500 },
  x_post: { width: 1200, height: 675 },
  sc_profile: { width: 320, height: 320 },
  sc_stories: { width: 1080, height: 1920 },
  yt_profile: { width: 800, height: 800 },
  yt_thumbnail: { width: 1280, height: 720 },
  yt_banner: { width: 2560, height: 1440 },
  bs_profile: { width: 400, height: 400 },
  bs_banner: { width: 1000, height: 1500 },
  bs_sqrPost: { width: 1000, height: 1500 },
  bs_lsPost: { width: 1200, height: 627 },
  bs_potrait: { width: 627, height: 1200 },
};

// Function to display messages to the user
function showMessage(message, type = "info") {
  messageBox.textContent = message;
  messageBox.classList.remove(
    "hidden",
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500"
  );
  if (type === "error") {
    messageBox.classList.add("bg-red-500");
  } else if (type === "success") {
    messageBox.classList.add("bg-green-500");
  } else {
    messageBox.classList.add("bg-blue-500");
  }
  setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 3000); // Hide message after 3 seconds
}

// Function to handle banner loading from a File object
function loadImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    showMessage("Please upload a valid banner file.", "error");
    return;
  }

  fileNameDisplay.textContent = `Selected file: ${file.name}`;
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img; // Store the banner object
      originalImage.src = e.target.result; // Display original image
      originalDimensions.textContent = `${img.width}px x ${img.height}px`;
      newWidthInput.value = img.width; // Pre-fill with original dimensions
      newHeightInput.value = img.height;
      socialPresetSelect.value = ""; // Reset type selection
      imageControls.classList.remove("hidden"); // Show controls
      resizedImageSection.classList.add("hidden"); // Hide resized section until resized
      showMessage("Banner loaded successfully!", "success");
    };
    img.onerror = () => {
      showMessage(
        "Could not load banner. Please try a different file.",
        "error"
      );
      fileNameDisplay.textContent = "";
      imageControls.classList.add("hidden");
    };
    img.src = e.target.result;
  };
  reader.onerror = () => {
    showMessage("Error reading file.", "error");
    fileNameDisplay.textContent = "";
    imageControls.classList.add("hidden");
  };
  reader.readAsDataURL(file);
}

// Event listener for file input change
imageUpload.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    loadImage(e.target.files[0]);
  }
});

// Drag and Drop functionality
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault(); // Prevent default to allow drop
  dropArea.classList.add("highlight");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("highlight");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault(); // Prevent default open behavior
  dropArea.classList.remove("highlight");

  if (e.dataTransfer.files.length > 0) {
    loadImage(e.dataTransfer.files[0]);
  }
});

// Event listener for social media type selection
socialPresetSelect.addEventListener("change", (e) => {
  const selectedPreset = e.target.value;
  if (selectedPreset && socialPresets[selectedPreset]) {
    newWidthInput.value = socialPresets[selectedPreset].width;
    newHeightInput.value = socialPresets[selectedPreset].height;
    showMessage(
      `Type "${e.target.options[e.target.selectedIndex].text}" applied.`,
      "info"
    );
  } else if (currentImage) {
    // If no type selected, revert to original image dimensions
    newWidthInput.value = currentImage.width;
    newHeightInput.value = currentImage.height;
  }
});

// Resize button click handler
resizeButton.addEventListener("click", () => {
  if (!currentImage) {
    showMessage("Please upload a banner first.", "error");
    return;
  }

  const newWidth = parseInt(newWidthInput.value);
  const newHeight = parseInt(newHeightInput.value);

  if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
    showMessage(
      "Please enter valid positive numbers for width and height.",
      "error"
    );
    return;
  }

  // Set canvas dimensions
  imageCanvas.width = newWidth;
  imageCanvas.height = newHeight;

  // Get 2D rendering context
  const ctx = imageCanvas.getContext("2d");

  // Clear the canvas before drawing
  ctx.clearRect(0, 0, newWidth, newHeight);

  // Draw the banner onto the canvas with new dimensions
  // This is where the resizing happens and quality is maintained by the browser's rendering engine.
  ctx.drawImage(currentImage, 0, 0, newWidth, newHeight);

  // Get the banner data from the canvas as a data URL
  const resizedImageDataUrl = imageCanvas.toDataURL("image/png"); // You can change to 'image/jpeg' for JPEG output

  // Set the download link href and display the section
  downloadLink.href = resizedImageDataUrl;
  downloadLink.download = `resized_${newWidth}x${newHeight}.png`; // Suggest a filename
  resizedImageSection.classList.remove("hidden");
  showMessage("Banner resized successfully!", "success");
});

// Initial message on page load
window.onload = () => {
  showMessage("Upload or drag a banner to get started!", "info");
};
