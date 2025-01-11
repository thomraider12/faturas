// Adicionar itens à tabela
document.getElementById('addItem').addEventListener('click', () => {
    const table = document.getElementById('itemsTable').querySelector('tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="border border-gray-300 px-2 py-1 dark:border-gray-600"><input type="text" class="w-full text-black"></td>
        <td class="border border-gray-300 px-2 py-1 dark:border-gray-600"><input type="number" class="w-full text-black"></td>
        <td class="border border-gray-300 px-2 py-1 dark:border-gray-600"><input type="number" class="w-full text-black"></td>
        <td class="border border-gray-300 px-2 py-1 text-center dark:border-gray-600">
            <button type="button" class="text-red-500 removeItem">Remover</button>
        </td>
    `;
    table.appendChild(row);
});

// Remover itens da tabela
document.getElementById('itemsTable').addEventListener('click', (e) => {
    if (e.target.classList.contains('removeItem')) {
        e.target.closest('tr').remove();
    }
});

// Gerar fatura e salvar dados no localStorage
document.getElementById('generateInvoice').addEventListener('click', () => {
    const businessName = document.getElementById('businessName').value;
    const businessEmail = document.getElementById('businessEmail').value;
    const businessLogoInput = document.getElementById('businessLogo');
    const clientName = document.getElementById('clientName').value;

    // Salvar dados no localStorage
    localStorage.setItem('businessName', businessName);
    localStorage.setItem('businessEmail', businessEmail);

    if (businessLogoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const logoBase64 = e.target.result;
            localStorage.setItem('businessLogo', logoBase64);  // Salva o logo em base64 no localStorage
        };
        reader.readAsDataURL(businessLogoInput.files[0]);
    }

    const tableRows = document.querySelectorAll('#itemsTable tbody tr');
    const items = Array.from(tableRows).map(row => {
        const inputs = row.querySelectorAll('input');
        return {
            product: inputs[0].value,
            quantity: inputs[1].value,
            price: inputs[2].value
        };
    });

    if (!businessName || !businessEmail || !clientName || items.some(item => !item.product || !item.quantity || !item.price)) {
        alert('Por favor, preencha todos os campos necessários.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: 'a4' });

    if (businessLogoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const logo = new Image();
            logo.src = e.target.result;
            logo.onload = () => {
                generatePDF(doc, businessName, businessEmail, logo, clientName, items);
            };
        };
        reader.readAsDataURL(businessLogoInput.files[0]);
    } else {
        generatePDF(doc, businessName, businessEmail, null, clientName, items);
    }
});

// Função para gerar PDF
function generatePDF(doc, businessName, businessEmail, logo, clientName, items) {
    if (logo) {
        doc.addImage(logo, 'PNG', 10, 10, 50, 20);  // Adiciona o logo ao PDF com largura de 50 e altura de 20
    }

    doc.setFont('Helvetica', 'bold');
    doc.text(businessName, 70, 20);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Email: ${businessEmail}`, 70, 30);

    doc.setFontSize(10);
    doc.text(`Cliente: ${clientName}`, 10, 50);

    let yOffset = 60;
    doc.text('Artigos:', 10, yOffset);

    yOffset += 10;
    doc.setFont('Helvetica', 'bold');
    doc.text('Produto', 10, yOffset);
    doc.text('Quantidade', 80, yOffset);
    doc.text('Preço (€)', 140, yOffset);

    yOffset += 10;
    doc.setFont('Helvetica', 'normal');
    items.forEach(item => {
        doc.text(item.product, 10, yOffset);
        doc.text(item.quantity, 80, yOffset, { align: 'right' });
        doc.text(item.price, 140, yOffset, { align: 'right' });
        yOffset += 10;
    });

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    yOffset += 10;
    doc.setFont('Helvetica', 'bold');
    doc.text(`Total: €${total.toFixed(2)}`, 10, yOffset);

    doc.save(`Factura_${clientName}.pdf`);
}

// Carregar dados do localStorage ao carregar a página
window.addEventListener('load', () => {
    const storedBusinessName = localStorage.getItem('businessName');
    const storedBusinessEmail = localStorage.getItem('businessEmail');
    const storedBusinessLogo = localStorage.getItem('businessLogo');

    if (storedBusinessName) {
        document.getElementById('businessName').value = storedBusinessName;
    }

    if (storedBusinessEmail) {
        document.getElementById('businessEmail').value = storedBusinessEmail;
    }

    if (storedBusinessLogo) {
        const imgElement = document.createElement('img');
        imgElement.src = storedBusinessLogo;

        // Redimensionar a imagem para um tamanho adequado
        imgElement.style.width = '100px'; // Ajuste o tamanho conforme necessário
        imgElement.style.height = 'auto'; // Mantém a proporção original

        document.getElementById('businessLogo').parentElement.appendChild(imgElement);
    }
});
