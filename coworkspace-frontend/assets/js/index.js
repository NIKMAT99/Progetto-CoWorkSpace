$(document).ready(function () {
    $.get('https://progetto-coworkspace.onrender.com/locations', function (data) {
        const container = $('#location-gallery'); // Cambiato da #location-list a #location-gallery
        container.empty();

        if (data.length === 0) {
            container.html('<div class="col-12 text-center"><p>Nessuna sede disponibile al momento.</p></div>');
            return;
        }

        data.forEach(loc => {
            // Usa cover_image_url invece di image_url
            const imgTag = loc.cover_image_url
                ? `<img class="card-img-top" src="${loc.cover_image_url}" alt="${loc.name}" style="height: 200px; object-fit: cover;">`
                : `<div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height: 200px;">
                     <i class="fas fa-building fa-3x text-light"></i>
                   </div>`;

            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm location-card">
                        ${imgTag}
                        <div class="card-body">
                            <h5 class="card-title">${loc.name}</h5>
                            <p class="card-text">${loc.address}, ${loc.city}</p>
                        </div>
                        <div class="card-footer bg-transparent">
                            <a href="location.html?id=${loc.id}" class="btn btn-primary btn-sm">Dettagli sede</a>
                        </div>
                    </div>
                </div>`;
            container.append(card);
        });
    }).fail(function () {
        $('#location-gallery').html('<div class="col-12"><div class="alert alert-danger">Errore nel caricamento delle sedi.</div></div>');
    });
});