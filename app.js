const url = "example.pdf";
var pdfFile = PDFJS.getDocument(url);


init();

function init() {
    pdfFile
        .then(function(pdf) {
            var pdfDocument = pdf;
            var pagesPromises = [];

            for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
                // Required to prevent that i is always the total of pages
                (function (pageNumber) {
                    pagesPromises.push(getPageText(pageNumber, pdfDocument));
                })(i + 1);
            }

            Promise.all(pagesPromises).then(function (pagesText) {
                var filtered = [];
                    myText = pagesText,
                    count = myText.length;
                for (var current = 0; current < count - 1; ++current) {
                    var curText = myText[current],
                        nextText = myText[current + 1];
                    if (nextText.indexOf(curText) === 0) continue;
                    else filtered.push(current + 1);
                }
                filtered.push(count);
                myRender(filtered);
            });
        });
}

function myRender(filtered) {
    pdfFile.then(function(pdf) {
        var currentPage = 1, 
            maxPage = filtered.length;
        function renderPage(page) {
            if (currentPage > maxPage) return;
            // Set zoom level
            var scale = 1.5;
            // Get viewport (dimensions)
            var viewport = page.getViewport(scale);
            // Get svg
            var container = document.getElementById('the-svg');
            // Set dimensions 
            container.style.height = viewport.height + 'px';
            container.style.width = viewport.width + 'px';

            // Render PDF page 
            page.getOperatorList().then(function(opList) {
                var svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
                return svgGfx.getSVG(opList, viewport);
            }).then(function(svg) {
                container.appendChild(svg);
                if (currentPage > maxPage) return;
                ++currentPage;
                console.log(currentPage);
                pdf.getPage(filtered[currentPage - 1]).then(renderPage);            
            });
        } 
        console.log(filtered);
        pdf.getPage(filtered[currentPage - 1]).then(renderPage);		
	});
}

function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";
                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }
                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}