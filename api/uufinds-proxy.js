export default async function handler(req, res) {
    const url = req.query.url;
    if (!url) {
        res.status(400).json({ error: 'missing url' });
        return;
    }

    const apiUrl = 'https://api.uufinds.com/open/api/convertUrl?from=21matte&url=' + encodeURIComponent(url);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}