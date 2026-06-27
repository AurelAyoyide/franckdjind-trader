const fs = require('fs');

const replacements = [
    [/\blecon\b/g, "leçon"],
    [/\bLecon\b/g, "Leçon"],
    [/\blecons\b/g, "leçons"],
    [/\bLecons\b/g, "Leçons"],
    [/\bParametre\b/g, "Paramètre"],
    [/\bparametre\b/g, "paramètre"],
    [/\bParametres\b/g, "Paramètres"],
    [/\bparametres\b/g, "paramètres"],
    [/\bCommunaute\b/g, "Communauté"],
    [/\bcommunaute\b/g, "communauté"],
    [/\bModeration\b/g, "Modération"],
    [/\bmoderation\b/g, "modération"],
    [/\bsecurite\b/g, "sécurité"],
    [/\bSecurite\b/g, "Sécurité"],
    [/\bEtape\b/g, "Étape"],
    [/\betape\b/g, "étape"],
    [/\bEtapes\b/g, "Étapes"],
    [/\betapes\b/g, "étapes"],
    [/\bCategorie\b/g, "Catégorie"],
    [/\bcategorie\b/g, "catégorie"],
    [/\bCategories\b/g, "Catégories"],
    [/\bcategories\b/g, "catégories"],
    [/\bTermine\b/g, "Terminé"],
    [/\bterminee\b/g, "terminée"],
    [/\bCree\b/g, "Créé"],
    [/\bcree\b/g, "créé"],
    [/\bCreez\b/g, "Créez"],
    [/\bCreer\b/g, "Créer"],
    [/\bcreer\b/g, "créer"],
    [/\bPublie\b/g, "Publié"],
    [/\bPubliee\b/g, "Publiée"],
    [/\bpubliee\b/g, "publiée"],
    [/\bArchive\b/g, "Archivé"],
    [/\barchivee\b/g, "archivée"],
    [/\bTemoignage\b/g, "Témoignage"],
    [/\btemoignage\b/g, "témoignage"],
    [/\bTemoignages\b/g, "Témoignages"],
    [/\btemoignages\b/g, "témoignages"],
    [/\bApercu\b/g, "Aperçu"],
    [/\bGeneral\b/g, "Général"],
    [/\bgeneral\b/g, "général"],
    [/\bDepose\b/g, "Dépose"],
    [/\bdeposez\b/g, "déposez"]
];

function applyFix(filePath) {
    let text = fs.readFileSync(filePath, 'utf-8');
    replacements.forEach(([regex, val]) => {
        text = text.replace(regex, val);
    });
    // Special rollback for object properties correctly unaccented
    text = text.replace(/catégories:/g, "categories:");
    text = text.replace(/leçon:/g, "lecon:");
    fs.writeFileSync(filePath, text);
}

applyFix('c:/Users/aurel/Documents/Rendu/franckdjind-trader/school/src/lib/i18n.ts');
applyFix('c:/Users/aurel/Documents/Rendu/franckdjind-trader/school/src/lib/platform-content.ts');
console.log("Done fixing School.");
