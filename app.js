function submitForm() {
  const form = document.getElementById('contactForm');
  const formData = new FormData(form);
  const jsonData = {};

  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

  fetch('https://yourserver.com/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData)
  })
  .then(response => response.json())
  .then(data => alert("Message sent successfully!"))
  .catch(error => console.error("Error:", error));
}