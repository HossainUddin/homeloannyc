const fs = require('fs');
const path = require('path');

const quotePath = path.join(__dirname, 'src', 'quote.html');
const fixedRatePath = path.join(__dirname, 'src', 'fixed_rate.html');

// Read quote.html
const quoteContent = fs.readFileSync(quotePath, 'utf8');

// Find the start of the wizard modal
const modalStartTag = '<!-- Multi-step Wizard Modal -->';
const modalStartIndex = quoteContent.indexOf(modalStartTag);
if (modalStartIndex === -1) {
  console.error('Could not find start of wizard modal in quote.html');
  process.exit(1);
}

// Extract the modal markup onwards (up to right before </body>)
const modalContentToCopy = quoteContent.substring(modalStartIndex, quoteContent.lastIndexOf('</body>'));

// Construct wizard-step-0 HTML
const step0Html = `
          <!-- Step 0: Choose Intent -->
          <div
            id="wizard-step-0"
            class="wizard-step w-full max-w-2xl mx-auto flex flex-col items-center"
          >
            <h2
              class="text-2xl md:text-3xl font-extrabold text-title text-center mb-8"
            >
              Are you purchasing or refinancing?
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div
                onclick="selectIntent('purchase')"
                class="group p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center cursor-pointer hover:border-primary hover:shadow-lg transition-all"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform"
                >
                  <i class="fa-solid fa-house-chimney"></i>
                </div>
                <span class="font-bold text-title">I'm purchasing</span>
              </div>
              <div
                onclick="selectIntent('refinance')"
                class="group p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center cursor-pointer hover:border-primary hover:shadow-lg transition-all"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform"
                >
                  <i class="fa-solid fa-arrows-rotate"></i>
                </div>
                <span class="font-bold text-title">I'm refinancing</span>
              </div>
            </div>
          </div>
`;

// Insert step 0 right inside the Steps Wrapper of the copied content
const stepsWrapperPattern = /<!-- Steps Wrapper -->\s*<div\s*class="flex-1 px-4 md:px-12 pt-12 md:pt-16 pb-8 flex flex-col justify-start md:justify-center overflow-y-auto"\s*>/;
const match = modalContentToCopy.match(stepsWrapperPattern);
if (!match) {
  console.error('Could not find steps wrapper in extracted modal content');
  process.exit(1);
}

const insertionPoint = match.index + match[0].length;
const updatedModalContent = 
  modalContentToCopy.substring(0, insertionPoint) + 
  step0Html + 
  modalContentToCopy.substring(insertionPoint);

// Read fixed_rate.html
let fixedRateContent = fs.readFileSync(fixedRatePath, 'utf8');

// Find script tags at the bottom to replace them with the updated modal + scripts
const footerCloseTag = '</footer>';
const footerCloseIndex = fixedRateContent.lastIndexOf(footerCloseTag);
if (footerCloseIndex === -1) {
  console.error('Could not find closing footer tag in fixed_rate.html');
  process.exit(1);
}

// Keep everything up to </footer>
const updatedFixedRateContent = 
  fixedRateContent.substring(0, footerCloseIndex + footerCloseTag.length) + 
  '\n\n    ' + 
  updatedModalContent + 
  '\n  </body>\n</html>\n';

// Write updated fixed_rate.html
fs.writeFileSync(fixedRatePath, updatedFixedRateContent, 'utf8');
console.log('Successfully inserted wizard modal with step 0 into fixed_rate.html');
