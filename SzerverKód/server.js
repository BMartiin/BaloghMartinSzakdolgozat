const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const { Layer, Network, Trainer } = require('synaptic');

const app = express();
const PORT = 3000;

const CONSUMER_KEY = 'EduTowerThesis2026';
const CONSUMER_SECRET = '8xK9pL2mN4qV7rT!';

const sessions = new Map();

const inputLayer = new Layer(2);
const hiddenLayer = new Layer(3);
const outputLayer = new Layer(3);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

const aiNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});

const trainer = new Trainer(aiNetwork);
trainer.train([
    { input: [0.9, 0.1], output: [1, 0, 0] },
    { input: [1.0, 0.2], output: [1, 0, 0] },
    { input: [0.5, 0.5], output: [0, 1, 0] },
    { input: [0.2, 0.8], output: [0, 0, 1] },
    { input: [0.1, 0.4], output: [0, 0, 1] }
], {
    iterations: 10000,
    error: 0.005
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/lti', (req, res) => {
    const userId = req.body.user_id || 'Ismeretlen_ID';
    const level = req.query.level || '1';
    const outcomeUrl = req.body.lis_outcome_service_url;
    const sourcedId = req.body.lis_result_sourcedid;
    const token = crypto.randomBytes(16).toString('hex');
    
    if (outcomeUrl && sourcedId) {
        sessions.set(token, {
            outcomeUrl: outcomeUrl,
            sourcedId: sourcedId
        });
    }

    res.redirect(`/?level=${level}&userid=${userId}&token=${token}`);
});

app.post('/api/score', async (req, res) => {
    const { userId, finalScore, token, playTime = 300 } = req.body;
    const sessionData = sessions.get(token);
    
    if (!sessionData) {
        return res.json({ status: "error", message: "Érvénytelen vagy lejárt token." });
    }

    const aiNormalizedScore = Math.max(0, Math.min(100, finalScore)) / 100;
    const aiNormalizedTime = Math.min(playTime / 600, 1);

    const result = aiNetwork.activate([aiNormalizedScore, aiNormalizedTime]);
    const categories = ["Profi", "Átlagos", "Segítségre szorul"];
    const maxIndex = result.indexOf(Math.max(...result));
    const aiAssessment = categories[maxIndex];

    console.log(`\n================ AI KIÉRTÉKELÉS ================`);
    console.log(`Játékos: ${userId}`);
    console.log(`Eredmény: ${finalScore} pont | Játékidő: ${playTime} másodperc`);
    console.log(`AI Kategória jóslat: >>> ${aiAssessment.toUpperCase()} <<<`);
    console.log(`================================================\n`);

    const normalizedScore = (Math.max(0, Math.min(100, finalScore)) / 100).toFixed(2);

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
    <imsx_POXHeader>
        <imsx_POXRequestHeaderInfo>
            <imsx_version>V1.0</imsx_version>
            <imsx_messageIdentifier>${Date.now()}</imsx_messageIdentifier>
        </imsx_POXRequestHeaderInfo>
    </imsx_POXHeader>
    <imsx_POXBody>
        <replaceResultRequest>
            <resultRecord>
                <sourcedGUID>
                    <sourcedId>${sessionData.sourcedId}</sourcedId>
                </sourcedGUID>
                <result>
                    <resultScore>
                        <language>en</language>
                        <textString>${normalizedScore}</textString>
                    </resultScore>
                </result>
            </resultRecord>
        </replaceResultRequest>
    </imsx_POXBody>
</imsx_POXEnvelopeRequest>`;

    const oauth = OAuth({
        consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
            return crypto.createHmac('sha1', key).update(base_string).digest('base64');
        },
        body_hash_function(data) {
            return crypto.createHash('sha1').update(data).digest('base64');
        }
    });

    const request_data = {
        url: sessionData.outcomeUrl,
        method: 'POST',
        data: xmlBody,
        includeBodyHash: true
    };

    const headers = oauth.toHeader(oauth.authorize(request_data));
    headers['Content-Type'] = 'application/xml';

    try {
        const response = await axios.post(sessionData.outcomeUrl, xmlBody, { headers });
        
        console.log(`\n--- MOODLE TÉNYLEGES VÁLASZA ---`);
        console.log(response.data);
        console.log(`--------------------------------\n`);
        
        console.log(`Siker: ${userId} pontszáma (${normalizedScore}) elküldve a Moodle-nek.`);
        sessions.delete(token);
        res.json({ status: "success" });
    } catch (error) {
        console.log("Moodle küldési hiba:", error.message);
        res.json({ status: "error" });
    }
});

app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});