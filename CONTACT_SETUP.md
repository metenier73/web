# Configuration du Formulaire de Contact

## Vue d'ensemble

Le formulaire de contact a été entièrement modernisé avec :
- ✅ Validation en temps réel
- ✅ Design moderne et responsive
- ✅ Protection anti-spam
- ✅ Envoi d'email fonctionnel
- ✅ Messages de confirmation
- ✅ Gestion d'erreurs complète

## Options d'envoi d'email

### 1. Script PHP (Recommandé) ✅

**Avantages :**
- Gratuit et sans limite
- Contrôle total
- Protection anti-spam intégrée
- Logs des messages

**Configuration :**
1. Modifiez `send-email.php` ligne 15 :
```php
$to_email = 'votre-email@domaine.com'; // Votre email de réception
```

2. Modifiez ligne 16 :
```php
$from_email = 'noreply@votredomaine.com'; // Email d'envoi
```

3. Assurez-vous que votre hébergeur supporte PHP et la fonction `mail()`

### 2. EmailJS (Alternative)

**Avantages :**
- Service tiers fiable
- Templates d'email personnalisables
- Pas besoin de serveur PHP

**Configuration :**
1. Créez un compte sur [EmailJS](https://www.emailjs.com/)
2. Configurez un service email (Gmail, Outlook, etc.)
3. Créez un template d'email
4. Modifiez `js/contact-form.js` :

```javascript
// Décommentez les lignes EmailJS
async sendFormData(data) {
  if (typeof EmailJS !== 'undefined') {
    return this.sendViaEmailJS(data);
  }
  return this.sendViaPHP(data);
}
```

5. Ajoutez dans `contact.html` avant `</body>` :
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
  EmailJS.init("YOUR_USER_ID");
</script>
```

### 3. Formspree (Service gratuit)

**Avantages :**
- Service gratuit jusqu'à 50 messages/mois
- Configuration simple
- Pas de serveur requis

**Configuration :**
1. Créez un compte sur [Formspree](https://formspree.io/)
2. Créez un nouveau formulaire
3. Modifiez `js/contact-form.js` :

```javascript
async sendFormData(data) {
  return this.sendViaFormspree(data);
}
```

4. Remplacez `YOUR_FORM_ID` dans la méthode `sendViaFormspree`

### 4. Mode Simulation (Tests)

Pour tester sans envoyer d'emails réels :

```javascript
async sendFormData(data) {
  return this.simulateSend(data);
}
```

## Fonctionnalités

### Validation
- ✅ Champs requis
- ✅ Format email valide
- ✅ Longueur du message (10-2000 caractères)
- ✅ Validation téléphone français
- ✅ Acceptation politique de confidentialité

### Protection anti-spam
- ✅ Honeypot (champ caché)
- ✅ Vérification vitesse de soumission
- ✅ Filtrage mots suspects
- ✅ Validation côté serveur

### Interface utilisateur
- ✅ Messages d'erreur en temps réel
- ✅ Indicateur de chargement
- ✅ Messages de succès/erreur
- ✅ Reset du formulaire
- ✅ Design responsive

## Personnalisation

### Modifier les champs

Dans `contact.html`, vous pouvez :
- Ajouter/supprimer des champs
- Modifier les options des selects
- Changer les messages d'erreur

### Modifier le style

Dans `contact.html` (section `<style>`) :
- Couleurs du formulaire
- Espacement
- Animations

### Modifier la validation

Dans `js/contact-form.js` :
- Règles de validation personnalisées
- Messages d'erreur
- Longueurs minimales/maximales

## Tests

### Test local
1. Ouvrez `contact.html` dans un navigateur
2. Remplissez le formulaire
3. Vérifiez la validation
4. Testez l'envoi (mode simulation)

### Test avec serveur
1. Uploadez les fichiers sur votre serveur
2. Configurez l'email dans `send-email.php`
3. Testez l'envoi réel

## Dépannage

### Erreur "Méthode non autorisée"
- Vérifiez que le serveur accepte les requêtes POST
- Vérifiez les permissions du fichier PHP

### Erreur d'envoi d'email
- Vérifiez la configuration email dans `send-email.php`
- Vérifiez que la fonction `mail()` est activée
- Consultez les logs d'erreur du serveur

### Formulaire ne se soumet pas
- Vérifiez la console JavaScript pour les erreurs
- Vérifiez que tous les fichiers JS sont chargés
- Vérifiez la validation des champs

## Sécurité

### Mesures implémentées
- ✅ Validation côté client et serveur
- ✅ Nettoyage des données
- ✅ Protection XSS
- ✅ Protection CSRF (via validation)
- ✅ Protection anti-spam

### Recommandations supplémentaires
- Utilisez HTTPS en production
- Limitez le taux de soumission
- Surveillez les logs d'erreur
- Mettez à jour régulièrement

## Support

Pour toute question ou problème :
1. Vérifiez les logs d'erreur
2. Testez en mode simulation
3. Consultez la documentation de votre service d'email
4. Contactez votre hébergeur si nécessaire

---

**Note :** Le formulaire est maintenant entièrement fonctionnel et prêt à être utilisé en production ! 