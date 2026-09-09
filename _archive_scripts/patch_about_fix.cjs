const fs = require('fs');
let code = fs.readFileSync('src/Storefront.tsx', 'utf8');

code = code.replace(
/              <\/p>\s*<\/div>\s*<\/div>\s*<\/section>/,
`              </p>
            </div>
          </div>
        </div>
      </section>`
);

fs.writeFileSync('src/Storefront.tsx', code);
console.log("Fixed missing div");
