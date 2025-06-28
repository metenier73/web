<?php
/**
 * Script d'envoi d'email pour le formulaire de contact
 * Version sécurisée avec validation et protection anti-spam
 */

// Configuration
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Configuration email
$to_email = 'metenier@yahoo.fr'; // Votre email
$from_name = 'Portfolio Contact';
$from_email = 'noreply@votredomaine.com'; // Email d'envoi (peut être le même)

// Fonction de nettoyage des données
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Fonction de validation email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Fonction de protection anti-spam
function isSpam($data) {
    // Vérification du honeypot (champ caché)
    if (!empty($data['honeypot'])) {
        return true;
    }
    
    // Vérification de la vitesse de soumission (moins de 3 secondes = spam probable)
    if (isset($data['timestamp'])) {
        $submission_time = time() - intval($data['timestamp']);
        if ($submission_time < 3) {
            return true;
        }
    }
    
    // Vérification du contenu suspect
    $suspicious_words = ['viagra', 'casino', 'loan', 'credit', 'buy now', 'click here'];
    $message = strtolower($data['message'] ?? '');
    foreach ($suspicious_words as $word) {
        if (strpos($message, $word) !== false) {
            return true;
        }
    }
    
    return false;
}

try {
    // Récupération des données JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Données invalides');
    }
    
    // Protection anti-spam
    if (isSpam($data)) {
        throw new Exception('Message détecté comme spam');
    }
    
    // Validation des champs requis
    $required_fields = ['civilite', 'nom', 'prenom', 'email', 'sujet', 'message'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Le champ $field est requis");
        }
    }
    
    // Validation de l'email
    if (!isValidEmail($data['email'])) {
        throw new Exception('Adresse email invalide');
    }
    
    // Nettoyage des données
    $civilite = cleanInput($data['civilite']);
    $nom = cleanInput($data['nom']);
    $prenom = cleanInput($data['prenom']);
    $email = cleanInput($data['email']);
    $telephone = cleanInput($data['telephone'] ?? '');
    $societe = cleanInput($data['societe'] ?? '');
    $sujet = cleanInput($data['sujet']);
    $message = cleanInput($data['message']);
    $newsletter = isset($data['newsletter']) && $data['newsletter'] ? 'Oui' : 'Non';
    
    // Validation de la longueur du message
    if (strlen($message) < 10) {
        throw new Exception('Le message doit contenir au moins 10 caractères');
    }
    
    if (strlen($message) > 2000) {
        throw new Exception('Le message ne peut pas dépasser 2000 caractères');
    }
    
    // Préparation du contenu de l'email
    $subject = "Nouveau message du portfolio - $sujet";
    
    $email_content = "
    <html>
    <head>
        <title>Nouveau message du portfolio</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <h2 style='color: #007bff;'>Nouveau message de contact</h2>
        
        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
            <tr>
                <td style='padding: 10px; background-color: #f8f9fa; font-weight: bold; border: 1px solid #dee2e6;'>Expéditeur</td>
                <td style='padding: 10px; border: 1px solid #dee2e6;'>$civilite $prenom $nom</td>
            </tr>
            <tr>
                <td style='padding: 10px; background-color: #f8f9fa; font-weight: bold; border: 1px solid #dee2e6;'>Email</td>
                <td style='padding: 10px; border: 1px solid #dee2e6;'><a href='mailto:$email'>$email</a></td>
            </tr>
            <tr>
                <td style='padding: 10px; background-color: #f8f9fa; font-weight: bold; border: 1px solid #dee2e6;'>Téléphone</td>
                <td style='padding: 10px; border: 1px solid #dee2e6;'>" . ($telephone ?: 'Non renseigné') . "</td>
            </tr>
            <tr>
                <td style='padding: 10px; background-color: #f8f9fa; font-weight: bold; border: 1px solid #dee2e6;'>Société</td>
                <td style='padding: 10px; border: 1px solid #dee2e6;'>" . ($societe ?: 'Non renseigné') . "</td>
            </tr>
            <tr>
                <td style='padding: 10px; background-color: #f8f9fa; font-weight: bold; border: 1px solid #dee2e6;'>Sujet</td>
                <td style='padding: 10px; border: 1px solid #dee2e6;'>$sujet</td>
            </tr>
            <tr>
                <td style='padding: 10px; background-color: #f8f9fa; font-weight: bold; border: 1px solid #dee2e6;'>Newsletter</td>
                <td style='padding: 10px; border: 1px solid #dee2e6;'>$newsletter</td>
            </tr>
        </table>
        
        <h3 style='color: #007bff;'>Message :</h3>
        <div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;'>
            " . nl2br($message) . "
        </div>
        
        <hr style='border: none; border-top: 1px solid #dee2e6; margin: 30px 0;'>
        
        <p style='font-size: 12px; color: #6c757d;'>
            <strong>Informations techniques :</strong><br>
            Date : " . date('d/m/Y H:i:s') . "<br>
            IP : " . $_SERVER['REMOTE_ADDR'] . "<br>
            User-Agent : " . ($data['userAgent'] ?? 'Non renseigné') . "<br>
            Référent : " . ($data['referrer'] ?? 'Direct') . "
        </p>
    </body>
    </html>
    ";
    
    // Configuration des headers email
    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $from_name . ' <' . $from_email . '>',
        'Reply-To: ' . $prenom . ' ' . $nom . ' <' . $email . '>',
        'X-Mailer: PHP/' . phpversion(),
        'X-Priority: 1',
        'X-MSMail-Priority: High'
    );
    
    // Envoi de l'email
    $mail_sent = mail($to_email, $subject, $email_content, implode("\r\n", $headers));
    
    if (!$mail_sent) {
        throw new Exception('Erreur lors de l\'envoi de l\'email');
    }
    
    // Email de confirmation à l'expéditeur
    $confirmation_subject = "Confirmation de votre message - Portfolio Myriam Metenier";
    $confirmation_content = "
    <html>
    <head>
        <title>Confirmation de message</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <h2 style='color: #28a745;'>Confirmation de réception</h2>
        
        <p>Bonjour $civilite $nom,</p>
        
        <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
        
        <div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;'>
            <strong>Sujet :</strong> $sujet<br>
            <strong>Message :</strong><br>
            " . nl2br($message) . "
        </div>
        
        <p>Je vous répondrai dans les plus brefs délais.</p>
        
        <p>Cordialement,<br>
        <strong>Myriam Metenier</strong><br>
        Développeuse Full Stack & Administratrice Système</p>
        
        <hr style='border: none; border-top: 1px solid #dee2e6; margin: 30px 0;'>
        
        <p style='font-size: 12px; color: #6c757d;'>
            Ce message a été envoyé automatiquement depuis le formulaire de contact du portfolio.
        </p>
    </body>
    </html>
    ";
    
    $confirmation_headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $from_name . ' <' . $from_email . '>',
        'X-Mailer: PHP/' . phpversion()
    );
    
    mail($email, $confirmation_subject, $confirmation_content, implode("\r\n", $confirmation_headers));
    
    // Log de l'envoi (optionnel)
    $log_entry = date('Y-m-d H:i:s') . " - Message de $email ($sujet)\n";
    file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
    
    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.'
    ]);
    
} catch (Exception $e) {
    // Log de l'erreur
    $error_log = date('Y-m-d H:i:s') . " - Erreur: " . $e->getMessage() . "\n";
    file_put_contents('error_log.txt', $error_log, FILE_APPEND | LOCK_EX);
    
    // Réponse d'erreur
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 