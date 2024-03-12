$(document).ready(function () {
  var video = document.getElementById("videoElement");
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var captureButton = document.getElementById("captureButton");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Could not access the camera: " + error);
    });

  $("#uploadForm").submit(function (event) {
    event.preventDefault();
    var fileInput = document.getElementById("imageInput");
    var formData = new FormData();
    formData.append("image", fileInput.files[0]);
    processImage(formData);
  });

  captureButton.addEventListener("click", function () {
    // Capture the current dimensions of the video
    var width = video.videoWidth;
    var height = video.videoHeight;

    // Set the canvas dimensions to match the video dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw the video frame onto the canvas
    context.drawImage(video, 0, 0, width, height);

    // Convert the canvas content to a blob
    canvas.toBlob(function (blob) {
      console.log("blob.type is ", blob.type);
      console.log("dimensions width is ", width);
      console.log("dimensions height is ", height);

      var formData = new FormData();
      formData.append("image", blob);
      processImage(formData);
      // context.drawImage(video, 0, 0, 400, 300);
      // canvas.toBlob(function (blob) {
      //   var formData = new FormData();
      //   formData.append("image", blob);
      //   console.log("blob.type is ", blob.type);
      //   console.log("dimensions width is ", blob.width);
      //   console.log("dimensions height is ", blob.height);
      //   console.log('formData is ', formData);

      //   processImage(formData);
    });
  });

  function processImage(formData) {
    $.ajax({
      url: "https://cv-instance-analyseimg-northeur.cognitiveservices.azure.com/computervision/imageanalysis:analyze?api-version=2024-02-01&features=people&model-version=latest&language=en&gender-neutral-caption=False",
      type: "POST",
      data: formData,
      processData: false,
      //   contentType: "application/octet-stream",
      contentType: "multipart/form-data",
      headers: {
        "Ocp-Apim-Subscription-Key": "169ba26709814440839c99da449b5421",
      },
      success: function (response) {
        var peopleResult = response.peopleResult.values;
        var highestConfidence = 0;

        // Loop through the peopleResult array to find the highest confidence
        for (var i = 0; i < peopleResult.length; i++) {
          var person = peopleResult[i];
          if (person.confidence > highestConfidence) {
            highestConfidence = person.confidence;
          }
        }

        // Check if the highest confidence is greater than 0.6
        if (highestConfidence > 0.6) {
          // Display message indicating the presence of a person
          var resultHeading = document.getElementById("resultHeading");
          resultHeading.innerHTML =
            '<h2 class="result-heading">This video contains a live person</h2>';
        } else {
          // Display message indicating no person detected or confidence too low
          var resultHeading = document.getElementById("resultHeading");
          resultHeading.innerHTML =
            '<h2 class="result-heading">No live person detected in the video</h2>';
        }
      },
      error: function () {
        var resultContainer = document.getElementById("resultContainer");
        var resultHeading = document.getElementById("resultHeading");
        resultContainer.innerHTML =
          "<p>An error occurred while processing the image.</p>";
        resultHeading.innerHTML = "";
      },
    });
  }
});
