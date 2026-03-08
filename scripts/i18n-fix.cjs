const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'src', 'locales');
const languages = ['en', 'es', 'ru', 'fr', 'de'];

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        try {
            let fileContent = fs.readFileSync(filePath, 'utf8');
            if (fileContent.charCodeAt(0) === 0xFEFF) {
                fileContent = fileContent.slice(1);
            }

            const data = JSON.parse(fileContent);

            if (data.achievements) {
                if (!data.achievement) data.achievement = {};
                Object.assign(data.achievement, data.achievements);
                delete data.achievements;

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
                console.log(`Merged achievements for ${lang}`);
            }
        } catch (e) {
            console.error(`Error processing ${lang}: ${e.message}`);
        }
    }
});
