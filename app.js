const url = "example.pdf";
var pdfFile = PDFJS.getDocument(url);
var texts = [];
init();


function getPdf() {
    var doc = new jsPDF();         
    var elementHandler = {
      '.ignorePDF': function (element, renderer) {
        return true;
      }
    };
    for (var i = 0; i < texts.length; ++i) {
        var source = "<h1>" + texts[i] + "</h1>";
        doc.fromHTML(source, 20, 20, {
              'width': 180,'elementHandlers': elementHandler
        });
        doc.setFontSize(50);
        doc.addPage();
    }
    doc.save("test.pdf");
}

$('#btn').click(function() {
    $(document).ready(function() {
        getPdf();
    });
});


function init() {
    PDFJS.workerSrc = "pdf.worker.js"
    pdfFile.then(function(pdf) {
        var pagesPromises = [...Array(pdf.pdfInfo.numPages).keys()]
                .map(numPage => getPageText(numPage + 1, pdf));

        Promise.all(pagesPromises).then(function (pagesText) {
            var filtered = [];
                myText = pagesText,
                count = myText.length;
            for (var current = 0; current < count - 1; ++current) {
                var curText = myText[current],
                    nextText = myText[current + 1];
                if (nextText.indexOf(curText) === 0) continue;
                else {
                    filtered.push(current + 1);
                    texts.push(curText);
                }
            }
            texts.push(myText[count - 1]);
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
            var scale = 1.25;
            // Get viewport (dimensions)
            var viewport = page.getViewport(scale);
            // Get svg
            var container = $('#the-svg')[0];
            // Set dimensions 
            container.style.height = viewport.height + 'px';
            container.style.width = viewport.width + 'px';

            // Render PDF page 
            page.getOperatorList().then(function(opList) {
                var svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
                return svgGfx.getSVG(opList, viewport);
            }).then(function(svg) {
                container.appendChild(svg);
                ++currentPage;
                pdf.getPage(filtered[currentPage - 1]).then(renderPage);            
            });
        } 
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