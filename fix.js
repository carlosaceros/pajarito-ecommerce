const fs = require('fs');

const files = [
    'src/components/WhatsAppButton.tsx',
    'src/app/garantias/page.tsx',
    'src/app/privacidad/page.tsx',
    'src/app/terminos/page.tsx',
    'src/app/politica-devolucion/page.tsx',
    'src/lib/blog-data.ts'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        content = content.replace(/57300XXXXXXX/g, '573026406089');
        content = content.replace(/\+57 300 XXX XXXX/g, '+57 302 640 6089');
        
        if (file === 'src/lib/blog-data.ts') {
            content = content.replace(/relatedProductId: 'detergente'/g, "relatedProductId: 'detergente-ropa-alto-rendimiento-hogar'");
            content = content.replace(/relatedProductId: 'suavizante'/g, "relatedProductId: 'suavizante-textil-maxima-suavidad-aroma'");
            content = content.replace(/relatedProductId: 'blanqueador'/g, "relatedProductId: 'blanqueador-desinfeccion-total'");
            content = content.replace(/relatedProductId: 'desengrasante'/g, "relatedProductId: 'desengrasante-rojo-arranca-grasa-extremo'");
        }
        
        fs.writeFileSync(file, content);
    }
});
