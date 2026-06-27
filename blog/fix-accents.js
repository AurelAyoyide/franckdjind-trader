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
    [/\bCategories\b/g, "Catégories"],
    [/\bTermine\b/g, "Terminé"],
    [/\bterminee\b/g, "terminée"],
    [/\bCree\b/g, "Créé"],
    [/\bCreez\b/g, "Créez"],
    [/\bCreer\b/g, "Créer"],
    [/\bPublie\b/g, "Publié"],
    [/\bPubliee\b/g, "Publiée"],
    [/\bArchive\b/g, "Archivé"],
    [/\barchivee\b/g, "archivée"],
    [/\bTemoignage\b/g, "Témoignage"],
    [/\bTemoignages\b/g, "Témoignages"],
    [/\bApercu\b/g, "Aperçu"],
    [/\bGeneral\b/g, "Général"],
    [/\bgeneral\b/g, "général"],
    [/\bDepose\b/g, "Dépose"],
    [/\bdeposez\b/g, "déposez"]
];

// Note: I deliberately REMOVED "categorie", "cree", "publiee", "temoignages" 
// in lower case regex to avoid accidentally overriding TypeScript keys like 'categorie' if they exist.
// Only uppercase words are kept for categories to be safe.

function applyFix(filePath) {
    if (!fs.existsSync(filePath)) return;
    let text = fs.readFileSync(filePath, 'utf-8');
    replacements.forEach(([regex, val]) => {
        text = text.replace(regex, val);
    });
    text = text.replace(/catégories:/g, "categories:");
    text = text.replace(/leçon:/g, "lecon:");
    fs.writeFileSync(filePath, text);
}

applyFix('c:/Users/aurel/Documents/Rendu/franckdjind-trader/blog/lib/admin-resources.ts');
applyFix('c:/Users/aurel/Documents/Rendu/franckdjind-trader/blog/lib/localization.ts');
applyFix('c:/Users/aurel/Documents/Rendu/franckdjind-trader/blog/prisma/seed.ts');
console.log("Done fixing Blog Strings.");
