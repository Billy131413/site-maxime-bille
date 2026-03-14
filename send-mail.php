<?php
/**
 * Traitement du formulaire de contact
 * Envoie un email au propriétaire + confirmation au client
 */

// === CONFIGURATION ===
$recipient    = 'contact@maxime-bille.fr';
$sender_email = 'ne-pas-repondre@maxime-bille.fr';
$site_name    = 'Maxime BILLE — Webdesigner Freelance';

// === CORS & HEADERS ===
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

// === HONEYPOT (anti-spam) ===
if (!empty($_POST['website'])) {
    // Un bot a rempli le champ caché
    echo json_encode(['success' => true, 'message' => 'Merci pour votre message.']);
    exit;
}

// === RÉCUPÉRATION & NETTOYAGE ===
function clean($value) {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

$full_name    = clean($_POST['full_name'] ?? '');
$email        = clean($_POST['email'] ?? '');
$company      = clean($_POST['company'] ?? '');
$phone        = clean($_POST['phone'] ?? '');
$project_type = clean($_POST['project_type'] ?? '');
$pack         = clean($_POST['pack'] ?? '');
$budget       = clean($_POST['budget'] ?? '');
$deadline     = clean($_POST['deadline'] ?? '');
$message      = clean($_POST['message'] ?? '');

// === VALIDATION ===
$errors = [];

if ($full_name === '') {
    $errors[] = 'Le nom est requis.';
}

if ($email === '' || !filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Une adresse email valide est requise.';
}

if ($message === '') {
    $errors[] = 'Le message est requis.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// === LABELS LISIBLES ===
$pack_labels = [
    'essentiel'        => 'Pack Essentiel',
    'artisan'          => 'Pack Artisan',
    'ecommerce'        => 'Pack E-commerce',
    'maintenance-simple' => 'Maintenance Simple',
    'maintenance-seo'  => 'Maintenance + SEO',
    'indecis'          => 'Je ne sais pas encore',
];

$type_labels = [
    'site-vitrine'      => 'Site vitrine',
    'site-multi-pages'  => 'Site multi-pages',
    'e-commerce'        => 'Site e-commerce',
    'refonte'           => 'Refonte de site',
    'autre'             => 'Autre',
];

$budget_labels = [
    'less-800'    => 'Moins de 800 €',
    '800-1500'    => '800 € – 1 500 €',
    '1500-2500'   => '1 500 € – 2 500 €',
    'more-2500'   => 'Plus de 2 500 €',
];

$deadline_labels = [
    'less-1-week' => "Moins d'1 semaine",
    '1-2-weeks'   => '1-2 semaines',
    '2-4-weeks'   => '2-4 semaines',
    'no-rush'     => 'Pas de rush',
];

$pack_label     = $pack_labels[$pack] ?? $pack;
$type_label     = $type_labels[$project_type] ?? $project_type;
$budget_label   = $budget_labels[$budget] ?? $budget;
$deadline_label = $deadline_labels[$deadline] ?? $deadline;

// === EMAIL AU PROPRIÉTAIRE ===
$subject_owner = "Nouvelle demande de $full_name";

$body_owner = "Nouvelle demande de contact depuis maxime-bille.fr\n";
$body_owner .= "================================================\n\n";
$body_owner .= "Nom :          $full_name\n";
$body_owner .= "Email :        $email\n";
if ($company)  $body_owner .= "Société :      $company\n";
if ($phone)    $body_owner .= "Téléphone :    $phone\n";
$body_owner .= "\n";
if ($type_label)     $body_owner .= "Type de projet : $type_label\n";
if ($pack_label)     $body_owner .= "Pack visé :      $pack_label\n";
if ($budget_label)   $body_owner .= "Budget :         $budget_label\n";
if ($deadline_label) $body_owner .= "Délai :          $deadline_label\n";
$body_owner .= "\nMessage :\n---------\n$message\n";

$headers_owner  = "From: $site_name <$sender_email>\r\n";
$headers_owner .= "Reply-To: $full_name <$email>\r\n";
$headers_owner .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers_owner .= "X-Mailer: PHP/" . phpversion();

$sent_owner = mail($recipient, $subject_owner, $body_owner, $headers_owner);

// === EMAIL DE CONFIRMATION AU CLIENT ===
$subject_client = "Bien reçu ! Je reviens vers vous rapidement";

$body_client  = "Bonjour $full_name,\n\n";
$body_client .= "Merci pour votre message ! J'ai bien reçu votre demande et je la traite personnellement.\n\n";
$body_client .= "Je vous recontacte sous 24h ouvrées avec une réponse adaptée.\n\n";
$body_client .= "En attendant, n'hésitez pas à consulter mes réalisations :\n";
$body_client .= "https://maxime-bille.fr/portfolio.html\n\n";
$body_client .= "À très bientôt,\n";
$body_client .= "Maxime BILLE\n";
$body_client .= "Webdesigner Freelance\n";
$body_client .= "https://maxime-bille.fr\n";

$headers_client  = "From: $site_name <$sender_email>\r\n";
$headers_client .= "Reply-To: $site_name <$recipient>\r\n";
$headers_client .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers_client .= "X-Mailer: PHP/" . phpversion();

mail($email, $subject_client, $body_client, $headers_client);

// === RÉPONSE ===
if ($sent_owner) {
    echo json_encode(['success' => true, 'message' => 'Votre message a bien été envoyé.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Une erreur est survenue. Contactez-moi directement à $recipient."]);
}
