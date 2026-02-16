<?php
/**
 * OG Meta Tag Handler for Social Media Crawlers
 *
 * Social media bots (WhatsApp, Facebook, Twitter, etc.) do not execute JavaScript.
 * Since this is a SPA, they only see the static index.html meta tags.
 * This PHP file fetches the listing data from Supabase and returns
 * proper OG meta tags so the listing's first image appears when shared.
 */

// Load config (gitignored - contains Supabase credentials)
$configPath = __DIR__ . '/og-config.php';
if (!file_exists($configPath)) {
    header('HTTP/1.1 302 Found');
    header('Location: /');
    exit;
}
require_once $configPath;

// Get the original request URI
$requestUri = $_SERVER['REQUEST_URI'];

// Extract listing ID from the slug (format: /ilan/some-title-123)
if (!preg_match('/\/ilan\/.*-(\d+)\/?$/', $requestUri, $matches)) {
    // Not a valid listing URL, redirect to homepage
    header('HTTP/1.1 302 Found');
    header('Location: /');
    exit;
}

$listingId = $matches[1];

$supabaseUrl = SUPABASE_URL;
$supabaseKey = SUPABASE_ANON_KEY;

// Fetch listing from Supabase REST API
$apiUrl = $supabaseUrl . '/rest/v1/listings?id=eq.' . intval($listingId) . '&select=title,type,price,currency,location,images,image';

$headers = [
    'http' => [
        'method' => 'GET',
        'header' => implode("\r\n", [
            'apikey: ' . $supabaseKey,
            'Authorization: Bearer ' . $supabaseKey,
            'Content-Type: application/json',
            'Accept: application/json'
        ]),
        'timeout' => 5
    ]
];

$context = stream_context_create($headers);
$response = @file_get_contents($apiUrl, false, $context);

if ($response === false || empty($response)) {
    header('HTTP/1.1 302 Found');
    header('Location: /');
    exit;
}

$listings = json_decode($response, true);

if (empty($listings) || !is_array($listings)) {
    header('HTTP/1.1 302 Found');
    header('Location: /');
    exit;
}

$listing = $listings[0];

// Determine the first image
$ogImage = '';

// Check images array
if (!empty($listing['images'])) {
    $images = $listing['images'];
    // If images is a string (JSON encoded), decode it
    if (is_string($images)) {
        $images = json_decode($images, true);
    }
    if (is_array($images) && count($images) > 0) {
        $ogImage = $images[0];
    }
}

// Fallback to single image field
if (empty($ogImage) && !empty($listing['image'])) {
    $ogImage = $listing['image'];
}

// Final fallback to default site image
if (empty($ogImage)) {
    $ogImage = 'https://topcuinsaatgayrimenkul.com/meta_image.jpg';
}

// Ensure absolute URL
if (!empty($ogImage) && strpos($ogImage, 'http') !== 0) {
    $ogImage = 'https://topcuinsaatgayrimenkul.com' . (strpos($ogImage, '/') === 0 ? '' : '/') . $ogImage;
}

// Optimize image for social media via wsrv.nl (free image proxy)
// Resizes large images to 1200x630 ~100-200KB so WhatsApp Status doesn't timeout
if (!empty($ogImage) && strpos($ogImage, 'supabase.co/') !== false) {
    $ogImage = 'https://wsrv.nl/?url=' . urlencode($ogImage) . '&w=1200&h=630&fit=cover&q=75&output=jpg';
}

// Currency symbol mapping
$currencySymbols = [
    'USD' => '$',
    'EUR' => "\xe2\x82\xac",
    'GBP' => "\xc2\xa3",
    'TL'  => "\xe2\x82\xba"
];
$currency = isset($listing['currency']) ? $listing['currency'] : 'TL';
$currencySymbol = isset($currencySymbols[$currency]) ? $currencySymbols[$currency] : "\xe2\x82\xba";

// Format price
$price = isset($listing['price']) ? number_format((float)$listing['price'], 0, ',', '.') : '0';

// Build meta tag values
$ogTitle = htmlspecialchars($listing['title'] . ' | Topcu İnşaat & Gayrimenkul', ENT_QUOTES, 'UTF-8');
$ogDescription = htmlspecialchars(
    ($listing['type'] ?? '') . ' - ' . $price . ' ' . $currencySymbol . ' - ' . ($listing['location'] ?? ''),
    ENT_QUOTES,
    'UTF-8'
);
$ogUrl = 'https://topcuinsaatgayrimenkul.com' . htmlspecialchars($requestUri, ENT_QUOTES, 'UTF-8');
$ogImageClean = htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8');

// Output minimal HTML with correct OG tags
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title><?php echo $ogTitle; ?></title>
    <meta name="description" content="<?php echo $ogDescription; ?>" />

    <!-- Open Graph -->
    <meta property="og:title" content="<?php echo $ogTitle; ?>" />
    <meta property="og:description" content="<?php echo $ogDescription; ?>" />
    <meta property="og:image" content="<?php echo $ogImageClean; ?>" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="<?php echo $ogUrl; ?>" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="tr_TR" />
    <meta property="og:site_name" content="Topcu İnşaat &amp; Gayrimenkul" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="<?php echo $ogTitle; ?>" />
    <meta name="twitter:description" content="<?php echo $ogDescription; ?>" />
    <meta name="twitter:image" content="<?php echo $ogImageClean; ?>" />
</head>
<body>
    <p><?php echo $ogTitle; ?></p>
    <p><?php echo $ogDescription; ?></p>
</body>
</html>
