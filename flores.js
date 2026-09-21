(function () {
    const params = new URLSearchParams(window.location.search);

    const config = {
        destinataria: params.get('para') || 'Para mi Abi',
        rosas: clamp(parseInt(params.get('rosas'), 10) || 89, 1, 200),
        girasoles: clamp(parseInt(params.get('girasoles'), 10) || 23, 1, 200),
        nota: params.get('nota') ||
            'Sembré {rosas} rosas y {girasoles} girasoles para ti. ' +
            'Ninguna se marchitará jamás. Tampoco lo hará lo que siento por ti.'
    };

    function clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }

    document.getElementById('destinataria').textContent = config.destinataria;
    document.getElementById('nota').textContent = config.nota
        .replace('{rosas}', config.rosas)
        .replace('{girasoles}', config.girasoles);

    const contenedor = document.getElementById('tallos');
    const dedicatoria = document.getElementById('dedicatoria');
    const botonReplantar = document.getElementById('replantar');

    const ROSA_TONOS = ['#e8628f', '#d94f7a', '#f28fae', '#c23f68', '#f4a6c1'];

    function crearPetalosRosa(tono) {
        const capas = [
            { cx: 50, cy: 34, r: 15 },
            { cx: 34, cy: 47, r: 14 },
            { cx: 66, cy: 47, r: 14 },
            { cx: 40, cy: 62, r: 14 },
            { cx: 60, cy: 62, r: 14 },
            { cx: 50, cy: 50, r: 12 }
        ];
        return capas.map(function (c) {
            return '<circle cx="' + c.cx + '" cy="' + c.cy + '" r="' + c.r +
                '" fill="' + tono + '" fill-opacity="0.92" />';
        }).join('');
    }

    function crearGirasol(petalos) {
        let partes = '';
        for (let i = 0; i < petalos; i++) {
            const angulo = (360 / petalos) * i;
            partes += '<ellipse cx="50" cy="50" rx="9" ry="21" fill="#f2b705" ' +
                'transform="rotate(' + angulo + ' 50 50) translate(0 -20)" />';
        }
        partes += '<circle cx="50" cy="50" r="13" fill="#4a2e12" />';
        partes += '<circle cx="50" cy="50" r="13" fill="none" stroke="#2f1c0a" stroke-width="1" opacity="0.5" />';
        return partes;
    }

    function construirFlorSVG(tipo) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        const tamano = tipo === 'girasol'
            ? 46 + Math.random() * 10
            : 34 + Math.random() * 10;
        svg.setAttribute('width', tamano);
        svg.setAttribute('height', tamano);

        if (tipo === 'girasol') {
            const petalos = 7 + Math.floor(Math.random() * 3);
            svg.innerHTML = crearGirasol(petalos);
        } else {
            const tono = ROSA_TONOS[Math.floor(Math.random() * ROSA_TONOS.length)];
            svg.innerHTML = crearPetalosRosa(tono);
        }
        return svg;
    }

    function crearFlor(tipo, xPorc, retrasoBase, indice) {
        const flor = document.createElement('div');
        flor.className = 'flor';
        flor.style.left = xPorc + '%';

        const alturaTallo = (tipo === 'girasol' ? 130 : 100) + Math.random() * 60;
        const duracionTallo = 0.9 + Math.random() * 0.5;
        const retraso = retrasoBase + indice * 0.045 + Math.random() * 0.25;

        const tallo = document.createElement('div');
        tallo.className = 'tallo';
        tallo.style.height = alturaTallo + 'px';
        tallo.style.animationDuration = duracionTallo + 's';
        tallo.style.animationDelay = retraso + 's';

        const hojaIzq = document.createElement('div');
        hojaIzq.className = 'hoja izq';
        hojaIzq.style.bottom = alturaTallo * 0.35 + 'px';
        hojaIzq.style.animationDuration = '0.6s';
        hojaIzq.style.animationDelay = (retraso + duracionTallo * 0.5) + 's';

        const hojaDer = document.createElement('div');
        hojaDer.className = 'hoja der';
        hojaDer.style.bottom = alturaTallo * 0.55 + 'px';
        hojaDer.style.animationDuration = '0.6s';
        hojaDer.style.animationDelay = (retraso + duracionTallo * 0.65) + 's';

        const cabeza = document.createElement('div');
        cabeza.className = 'cabeza';
        cabeza.style.bottom = alturaTallo + 'px';
        cabeza.style.animationDuration = '0.7s';
        const retrasoCabeza = retraso + duracionTallo * 0.85;
        cabeza.style.animationDelay = retrasoCabeza + 's';
        cabeza.style.setProperty('--retraso-mecer', retrasoCabeza + 's');
        cabeza.appendChild(construirFlorSVG(tipo));
        cabeza.querySelector('svg').style.animationDelay = retrasoCabeza + 's';

        flor.appendChild(tallo);
        flor.appendChild(hojaIzq);
        flor.appendChild(hojaDer);
        flor.appendChild(cabeza);

        return { el: flor, terminaEn: retraso + duracionTallo + 0.7 };
    }

    function sembrarJardin() {
        contenedor.innerHTML = '';
        dedicatoria.classList.remove('visible');

        const total = config.rosas + config.girasoles;
        const tipos = new Array(config.rosas).fill('rosa')
            .concat(new Array(config.girasoles).fill('girasol'));

        for (let i = tipos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tipos[i], tipos[j]] = [tipos[j], tipos[i]];
        }

        const posiciones = [];
        for (let i = 0; i < total; i++) {
            posiciones.push(2 + (96 * i) / Math.max(total - 1, 1) + (Math.random() * 3 - 1.5));
        }

        let maxFin = 0;
        const fragmento = document.createDocumentFragment();

        tipos.forEach(function (tipo, i) {
            const resultado = crearFlor(tipo, posiciones[i], 0.15, i);
            fragmento.appendChild(resultado.el);
            if (resultado.terminaEn > maxFin) {
                maxFin = resultado.terminaEn;
            }
        });

        contenedor.appendChild(fragmento);

        setTimeout(function () {
            dedicatoria.classList.add('visible');
        }, (maxFin + 0.3) * 1000);
    }

    botonReplantar.addEventListener('click', sembrarJardin);

    sembrarJardin();
})();
