$(document).ready(function () {
    $.get('http://localhost:3000/locations', function (data) {
        const container = $('#location-list');
        container.empty();

        data.forEach(loc => {
            const card = `
        <div class="col">
          <div class="card h-100 shadow">
            <div class="card-body">
              <h5 class="card-title">${loc.name}</h5>
              <p class="card-text">${loc.address}</p>
              <p class="text-muted">${loc.city}</p>
            </div>
          </div>
        </div>
      `;
            container.append(card);
        });
    }).fail(function () {
        $('#location-list').html('<p class="text-danger">Errore nel caricamento delle sedi.</p>');
    });
});
