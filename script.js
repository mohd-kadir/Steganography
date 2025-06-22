const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const outputImg = document.getElementById("outputImage");

function encode() {
  const fileInput = document.getElementById("imageInput");
  const message = document.getElementById("message").value;
  const password = document.getElementById("password").value;

  if (!fileInput.files[0] || !message || !password) {
    alert("Upload image, enter message & password!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Encrypt message
      const encrypted = CryptoJS.AES.encrypt(message, password).toString() + "###";

      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;

      for (let i = 0; i < encrypted.length && i * 4 + 2 < data.length; i++) {
        data[i * 4 + 2] = encrypted.charCodeAt(i); // Blue channel
      }

      ctx.putImageData(imgData, 0, 0);
      outputImg.src = canvas.toDataURL("image/png");
      alert("✅ Message encrypted and embedded!");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function decode() {
  const fileInput = document.getElementById("imageInput");
  const password = document.getElementById("password").value;

  if (!fileInput.files[0] || !password) {
    alert("Upload an encoded image and enter password.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Draw uploaded image to canvas
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data from canvas
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      let encrypted = "";
      for (let i = 0; i < data.length; i += 4) {
        const char = String.fromCharCode(data[i + 2]);
        encrypted += char;
        if (encrypted.endsWith("###")) break;
      }

      encrypted = encrypted.replace("###", "");

      try {
        const decrypted = CryptoJS.AES.decrypt(encrypted, password);
        const message = decrypted.toString(CryptoJS.enc.Utf8);
        if (!message) throw new Error("Wrong password or corrupted data");
        document.getElementById("decodedMessage").innerText =
          "📩 Decrypted Message: " + message;
      } catch {
        alert("❌ Decryption failed. Wrong password or corrupted data.");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "encoded_image.png";
  link.href = canvas.toDataURL();
  link.click();
}

