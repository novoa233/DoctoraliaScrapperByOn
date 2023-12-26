const puppeteer = require('puppeteer');
const fs = require('fs');

async function handleDynamicWebPage(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //codigo experimental, raspa por pagina web ingresada en "await page.goto ()"
  await page.goto('https://www.doctoralia.cl/buscar?q=Neur%C3%B3logo&loc=Talca&filters%5Bspecializations%5D%5B%5D=40');

  const results = await page.evaluate(() => {
    const doctors = document.querySelectorAll(".card-body.p-0");
    const data = [];

    doctors.forEach(doctor => {
      const name = doctor.querySelector(".h4").innerText;
      const specialization = doctor.querySelector('.h5').innerText;
      const address = doctor.querySelector('.text-truncate').innerText;
      const mapLinkElement = doctor.querySelector('[data-test-id="address-map-link"]');
      const mapLink = mapLinkElement ? mapLinkElement.getAttribute('href') : '';
      const entityNameElement = doctor.querySelector('[data-test-id="entity-name"]');
      const entityName = entityNameElement ? entityNameElement.innerText.trim() : '';

      data.push({
        name,
        specialization,
        address,
        entityName,
        mapLink

      });
    });

    return data;
  });

  await browser.close();

  return results;
}

async function scrapeAndSaveData(url, outputCSV, outputJSON) {
  const data = await handleDynamicWebPage(url);

  // Save to CSV
  const csvContent = 'Name,Specialization,Address,MapLink\n' + data.map(doctor => Object.values(doctor).join(',')).join('\n');
  fs.writeFileSync(outputCSV, csvContent, 'utf-8');

  // Save to JSON
  fs.writeFileSync(outputJSON, JSON.stringify(data, null, 2), 'utf-8');

  console.log('Data guardada exitosamente by on!');
}

// Example usage
const urlToScrape = 'https://www.doctoralia.cl/buscar?q=Neur%C3%B3logo&loc=Talca&filters%5Bspecializations%5D%5B%5D=40';
const outputCSV = 'doctors_data.csv';
const outputJSON = 'doctors_data.json';

scrapeAndSaveData(urlToScrape, outputCSV, outputJSON);
