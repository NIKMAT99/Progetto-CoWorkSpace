$(document).ready(function () {
    $.get('http://localhost:3000/locations', function (locations) {
        const container = $('#location-gallery');
        container.empty();

        locations.forEach(loc => {
            container.append(`
        <div class="col-md-4">
          <div class="card h-100 shadow">
            <img src="assets/img/locations/${loc.id}.jpg" class="card-img-top" alt="${loc.name}">
            <div class="card-body">
              <h5 class="card-title">${loc.name}</h5>
              <p class="card-text">${loc.city}</p>
              <a href="location.html?id=${loc.id}" class="btn btn-primary">Scopri di più</a>
            </div>
          </div>
        </div>
      `);
        });
    });
});
