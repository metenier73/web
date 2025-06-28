/**
 * Contact Form Handler
 * Gestion complète du formulaire de contact avec validation et envoi d'email
 */

class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.submitBtn = document.getElementById('submitBtn');
    this.loadingSpinner = document.getElementById('loadingSpinner');
    this.successMessage = document.getElementById('successMessage');
    this.errorMessage = document.getElementById('errorMessage');
    this.errorText = document.getElementById('errorText');
    
    this.init();
  }

  init() {
    if (this.form) {
      this.setupEventListeners();
      this.setupValidation();
    }
  }

  setupEventListeners() {
    // Gestion de la soumission du formulaire
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Validation en temps réel
    this.form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearFieldError(field));
    });

    // Validation du message en temps réel
    const messageField = document.getElementById('message');
    if (messageField) {
      messageField.addEventListener('input', () => this.validateMessageLength(messageField));
    }

    // Validation de l'email en temps réel
    const emailField = document.getElementById('email');
    if (emailField) {
      emailField.addEventListener('input', () => this.validateEmail(emailField));
    }

    // Gestion du reset
    this.form.addEventListener('reset', () => this.handleReset());
  }

  setupValidation() {
    // Validation personnalisée pour les champs requis
    const requiredFields = this.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      field.addEventListener('invalid', (e) => {
        e.preventDefault();
        this.showFieldError(field, this.getErrorMessage(field));
      });
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    // Masquer les messages précédents
    this.hideMessages();
    
    // Validation complète
    if (!this.validateForm()) {
      return;
    }

    // Préparation des données
    const formData = this.getFormData();
    
    // Affichage du loading
    this.setLoading(true);
    
    try {
      // Envoi des données
      const response = await this.sendFormData(formData);
      
      if (response.success) {
        this.showSuccess();
        this.form.reset();
        this.form.classList.remove('was-validated');
      } else {
        throw new Error(response.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur formulaire:', error);
      this.showError(error.message || 'Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      this.setLoading(false);
    }
  }

  validateForm() {
    let isValid = true;
    
    // Validation des champs requis
    const requiredFields = this.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Validation spécifique du message
    const messageField = document.getElementById('message');
    if (messageField && !this.validateMessageLength(messageField)) {
      isValid = false;
    }

    // Validation de l'email
    const emailField = document.getElementById('email');
    if (emailField && !this.validateEmail(emailField)) {
      isValid = false;
    }

    // Validation de la confidentialité
    const confidentialiteField = document.getElementById('confidentialite');
    if (confidentialiteField && !confidentialiteField.checked) {
      this.showFieldError(confidentialiteField, 'Vous devez accepter la politique de confidentialité.');
      isValid = false;
    }

    if (!isValid) {
      this.form.classList.add('was-validated');
    }

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Validation selon le type de champ
    switch (field.type) {
      case 'email':
        isValid = this.isValidEmail(value);
        errorMessage = 'Veuillez saisir une adresse email valide.';
        break;
      case 'tel':
        if (value && !this.isValidPhone(value)) {
          isValid = false;
          errorMessage = 'Veuillez saisir un numéro de téléphone valide.';
        }
        break;
      default:
        if (field.hasAttribute('required') && !value) {
          isValid = false;
          errorMessage = this.getErrorMessage(field);
        }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    } else {
      this.clearFieldError(field);
    }

    return isValid;
  }

  validateEmail(field) {
    const email = field.value.trim();
    if (email && !this.isValidEmail(email)) {
      this.showFieldError(field, 'Veuillez saisir une adresse email valide.');
      return false;
    } else {
      this.clearFieldError(field);
      return true;
    }
  }

  validateMessageLength(field) {
    const message = field.value.trim();
    const minLength = 10;
    
    if (message.length > 0 && message.length < minLength) {
      this.showFieldError(field, `Le message doit contenir au moins ${minLength} caractères.`);
      return false;
    } else {
      this.clearFieldError(field);
      return true;
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    // Accepte les formats français et internationaux
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  getErrorMessage(field) {
    const fieldName = field.name || field.id;
    const fieldType = field.type;
    
    switch (fieldType) {
      case 'email':
        return 'Veuillez saisir une adresse email valide.';
      case 'tel':
        return 'Veuillez saisir un numéro de téléphone valide.';
      default:
        return `Le champ ${fieldName} est requis.`;
    }
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    formData.forEach((value, key) => {
      if (key === 'newsletter') {
        data[key] = value === 'on';
      } else {
        data[key] = value;
      }
    });

    // Ajout d'informations supplémentaires
    data.timestamp = new Date().toISOString();
    data.userAgent = navigator.userAgent;
    data.referrer = document.referrer;
    
    return data;
  }

  async sendFormData(data) {
    // Option 1: Envoi via EmailJS (recommandé pour un portfolio)
    if (typeof EmailJS !== 'undefined') {
      return this.sendViaEmailJS(data);
    }
    
    // Option 2: Envoi via Formspree (service gratuit)
    return this.sendViaFormspree(data);
    
    // Option 3: Simulation pour test
    // return this.simulateSend(data);
  }

  async sendViaEmailJS(data) {
    try {
      const templateParams = {
        from_name: `${data.civilite} ${data.prenom} ${data.nom}`,
        from_email: data.email,
        from_phone: data.telephone || 'Non renseigné',
        from_company: data.societe || 'Non renseigné',
        subject: data.sujet,
        message: data.message,
        newsletter: data.newsletter ? 'Oui' : 'Non'
      };

      const response = await EmailJS.send(
        'YOUR_SERVICE_ID', // Remplacez par votre Service ID
        'YOUR_TEMPLATE_ID', // Remplacez par votre Template ID
        templateParams,
        'YOUR_USER_ID' // Remplacez par votre User ID
      );

      return { success: true, message: 'Message envoyé avec succès' };
    } catch (error) {
      throw new Error('Erreur lors de l\'envoi via EmailJS');
    }
  }

  async sendViaFormspree(data) {
    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return { success: true, message: 'Message envoyé avec succès' };
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      throw new Error('Erreur lors de l\'envoi via Formspree');
    }
  }

  simulateSend(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Données du formulaire:', data);
        resolve({ success: true, message: 'Message simulé avec succès' });
      }, 2000);
    });
  }

  setLoading(loading) {
    if (loading) {
      this.submitBtn.disabled = true;
      this.loadingSpinner.classList.add('show');
      this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Envoi en cours...';
    } else {
      this.submitBtn.disabled = false;
      this.loadingSpinner.classList.remove('show');
      this.submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Envoyer le message';
    }
  }

  showSuccess() {
    this.successMessage.style.display = 'block';
    this.errorMessage.style.display = 'none';
    
    // Scroll vers le message
    this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide après 5 secondes
    setTimeout(() => {
      this.hideMessages();
    }, 5000);
  }

  showError(message) {
    this.errorText.textContent = message;
    this.errorMessage.style.display = 'block';
    this.successMessage.style.display = 'none';
    
    // Scroll vers le message
    this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  hideMessages() {
    this.successMessage.style.display = 'none';
    this.errorMessage.style.display = 'none';
  }

  handleReset() {
    // Nettoyer les erreurs lors du reset
    this.form.querySelectorAll('.is-invalid').forEach(field => {
      this.clearFieldError(field);
    });
    
    this.form.classList.remove('was-validated');
    this.hideMessages();
  }
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  new ContactForm();
});

// Configuration pour EmailJS (optionnel)
// EmailJS.init("YOUR_USER_ID");

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContactForm;
} 