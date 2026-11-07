

(function () {
    "use strict";

    
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    const almacen = {
        leer(clave) { try { return localStorage.getItem(clave); } catch (e) { return null; } },
        guardar(clave, valor) { try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } }
    };

    if (almacen.leer("iot-tema") === "oscuro") {
        document.documentElement.classList.add("js-oscuro");
    }

    
    function inyectarEstilos() {
        const css = `
        /* Foco visible para quien navega con teclado */
        .js-btn:focus-visible { outline: 3px solid #b8742a; outline-offset: 2px; }

        /* Botones flotantes */
        .js-btn {
            position: fixed; bottom: 20px; width: 46px; height: 46px; border: none; border-radius: 50%;
            background: #94694a; color: #fff; font-size: 1.2rem; cursor: pointer; z-index: 2500;
            box-shadow: 0 4px 12px rgba(0,0,0,.25);
        }
        .js-btn:hover { background: #6f4a2f; }
        .js-arriba { right: 20px; display: none; }
        .js-arriba.visible { display: block; }
        .js-tema { left: 20px; }

        /* Aviso temporal */
        .js-toast {
            position: fixed; left: 50%; bottom: 80px; transform: translateX(-50%);
            background: #3b2a1e; color: #fff; border: 1px solid #8b6b52; padding: .6rem 1.2rem;
            border-radius: 8px; font-size: .9rem; display: none; z-index: 3500;
        }
        .js-toast.visible { display: block; }

        /* Modo oscuro */
        html.js-oscuro body { background-color: #1f1611; color: #f1e6dc; }
        html.js-oscuro h1, html.js-oscuro h2, html.js-oscuro h3 { color: #e0b896; }
        html.js-oscuro header { background-color: #2b1f17; box-shadow: 0 1px 3px rgba(0,0,0,.5); }
        html.js-oscuro .site-title { color: #e0b896; }
        html.js-oscuro .site-title span { color: #b9a493; }
        html.js-oscuro .nav-tab { color: #d8c6b6; }
        html.js-oscuro .nav-tab:hover { background-color: #4a3426; color: #ffffff; }
        html.js-oscuro .nav-tab.active { background-color: #94694a; color: #ffffff; }
        html.js-oscuro main { background-color: #2b1f17; box-shadow: 0 4px 6px -1px rgba(0,0,0,.4); }
        html.js-oscuro h2 { border-bottom-color: #4a3426; }
        html.js-oscuro footer { background-color: #140e0a; }
        html.js-oscuro img { filter: brightness(.9); }
        `;
        const estilo = document.createElement("style");
        estilo.id = "js-estilos";
        estilo.textContent = css;
        document.head.appendChild(estilo);
    }

    
    let toast, temporizadorToast;
    function mostrarAviso(texto) {
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "js-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }
        toast.textContent = texto;
        toast.classList.add("visible");
        clearTimeout(temporizadorToast);
        temporizadorToast = setTimeout(() => toast.classList.remove("visible"), 2000);
    }

    
    function iniciarTema() {
        const raiz = document.documentElement;
        const boton = document.createElement("button");
        boton.className = "js-btn js-tema";
        boton.type = "button";

        function pintarBoton() {
            const oscuro = raiz.classList.contains("js-oscuro");
            boton.textContent = oscuro ? "☀" : "☾";
            boton.title = oscuro ? "Cambiar a modo claro (tecla D)" : "Cambiar a modo oscuro (tecla D)";
            boton.setAttribute("aria-label", boton.title);
            boton.setAttribute("aria-pressed", String(oscuro));
        }
        function alternar() {
            const oscuro = raiz.classList.toggle("js-oscuro");
            almacen.guardar("iot-tema", oscuro ? "oscuro" : "claro");
            pintarBoton();
            mostrarAviso(oscuro ? "Modo oscuro activado" : "Modo claro activado");
        }
        boton.addEventListener("click", alternar);
        pintarBoton();
        document.body.appendChild(boton);
        return alternar;
    }

    
    function iniciarVolverArriba() {
        const boton = document.createElement("button");
        boton.className = "js-btn js-arriba";
        boton.type = "button";
        boton.textContent = "↑";
        boton.title = "Volver arriba";
        boton.setAttribute("aria-label", "Volver arriba");
        boton.addEventListener("click", () => window.scrollTo(0, 0));
        document.body.appendChild(boton);

        function actualizar() {
            boton.classList.toggle("visible", window.scrollY > 300);
        }
        window.addEventListener("scroll", actualizar, { passive: true });
        actualizar();
    }

    
    function iniciarAtajos(alternarTema) {
        const enlaces = $$(".navbar a");
        enlaces.forEach((a, i) => {
            a.title = `${a.textContent.trim()} (tecla ${i + 1})`;
        });

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const destino = e.target;
            if (destino && /^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName)) return;
            if (destino && destino.isContentEditable) return;

            if (/^[1-9]$/.test(e.key)) {
                const enlace = enlaces[Number(e.key) - 1];
                if (enlace) window.location.href = enlace.getAttribute("href");
            } else if (e.key === "d" || e.key === "D") {
                alternarTema();
            }
        });
    }

    
    document.addEventListener("DOMContentLoaded", () => {
        inyectarEstilos();
        const alternarTema = iniciarTema();
        iniciarVolverArriba();
        iniciarAtajos(alternarTema);
        console.log("Sitio web de IoT cargado con interactividad activa.");
    });
})();
