const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-menu-toggle]");

// Published Google Forms URL used by the lab interest form action.
const JOIN_FORM_URL = "https://forms.gle/B2HewMtgdWKgW6ME8";
const joinFormLink = document.querySelector("[data-join-form-link]");
const joinFormStatus = document.querySelector("[data-join-form-status]");

if (joinFormLink && JOIN_FORM_URL) {
  joinFormLink.href = JOIN_FORM_URL;
  joinFormLink.target = "_blank";
  joinFormLink.rel = "noopener noreferrer";
  joinFormLink.removeAttribute("aria-disabled");
  if (joinFormStatus) {
    joinFormStatus.textContent = "The form opens in a new tab and takes about 3–5 minutes.";
  }
}

joinFormLink?.addEventListener("click", (event) => {
  if (!JOIN_FORM_URL) {
    event.preventDefault();
    joinFormStatus?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

toggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

nav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  }
});

const intro = document.querySelector("[data-intro-loader]");
const introCanvas = document.querySelector("[data-intro-canvas]");
const introSkip = document.querySelector("[data-intro-skip]");
let introRenderer;
let introAnimation = 0;
let introClosed = false;
let introStarted = false;
let introReady = false;
window.__b3IntroStats = {
  frames: 0,
  samples: [],
  lastRotationY: 0
};

function closeIntro() {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add("is-hidden");
  window.setTimeout(() => {
    if (introAnimation) cancelAnimationFrame(introAnimation);
    if (introRenderer) introRenderer.dispose();
    intro.setAttribute("aria-hidden", "true");
  }, 760);
}

function createTextTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "rgba(104, 172, 229, 0.92)";
  ctx.font = "800 48px Arial, Helvetica, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("JOHNS HOPKINS UNIVERSITY", 1024, 214);

  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 112px Georgia, 'Times New Roman', serif";
  ctx.fillText("Brains Bots", 1024, 420);
  ctx.fillText("and Behavior Lab", 1024, 558);

  ctx.strokeStyle = "rgba(104, 172, 229, 0.9)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(650, 764);
  ctx.lineTo(1398, 764);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) {
    texture.colorSpace = THREE.SRGBColorSpace;
  } else if (THREE.sRGBEncoding) {
    texture.encoding = THREE.sRGBEncoding;
  }
  texture.anisotropy = 8;
  return texture;
}

function initIntro() {
  if (!intro || !introCanvas || introStarted) return;
  introStarted = true;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    window.setTimeout(closeIntro, 900);
    return;
  }

  try {
    introRenderer = new THREE.WebGLRenderer({
      canvas: introCanvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    introRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    if (THREE.SRGBColorSpace) {
      introRenderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if (THREE.sRGBEncoding) {
      introRenderer.outputEncoding = THREE.sRGBEncoding;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8.4);

    const group = new THREE.Group();
    scene.add(group);

    const textTexture = createTextTexture();
    const textGeometry = new THREE.PlaneGeometry(8.7, 4.35);

    for (let i = 4; i >= 0; i -= 1) {
      const material = new THREE.MeshBasicMaterial({
        map: textTexture,
        color: i === 0 ? 0xffffff : 0x68ace5,
        transparent: true,
        opacity: i === 0 ? 0.98 : 0.03 + i * 0.008,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(textGeometry, material);
      mesh.position.set(i * -0.012, i * 0.007, i * -0.045);
      group.add(mesh);
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x68ace5,
      transparent: true,
      opacity: 0.56
    });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-4.6, -2.1, -0.5),
      new THREE.Vector3(4.6, -2.1, -0.5)
    ]);
    group.add(new THREE.Line(lineGeometry, lineMaterial));

    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.1;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xb9d8f2,
      size: 0.022,
      transparent: true,
      opacity: 0.5
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    function resizeIntro() {
      const width = intro.clientWidth || window.innerWidth;
      const height = intro.clientHeight || window.innerHeight;
      introRenderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const scale = width < 520 ? 0.48 : width < 820 ? 0.68 : 1;
      group.scale.setScalar(scale);
    }

    function sampleIntroFrame() {
      const gl = introRenderer.getContext();
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const pixel = new Uint8Array(4);
      let lit = 0;
      let alpha = 0;
      let total = 0;

      for (let x = Math.floor(width * 0.22); x <= Math.floor(width * 0.78); x += Math.max(1, Math.floor(width * 0.14))) {
        for (let y = Math.floor(height * 0.28); y <= Math.floor(height * 0.72); y += Math.max(1, Math.floor(height * 0.11))) {
          gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
          if (pixel[0] + pixel[1] + pixel[2] > 24) lit += 1;
          if (pixel[3] > 0) alpha += 1;
          total += 1;
        }
      }

      window.__b3IntroStats.samples.push({ lit, alpha, total, width, height });
      window.__b3IntroStats.samples = window.__b3IntroStats.samples.slice(-6);
    }

    function animateIntro(time) {
      const seconds = time * 0.001;
      group.rotation.y = Math.sin(seconds * 0.7) * 0.08;
      group.rotation.x = Math.sin(seconds * 0.5) * 0.025;
      group.position.y = Math.sin(seconds * 0.9) * 0.055;
      particles.rotation.z = seconds * 0.035;
      particles.rotation.y = seconds * 0.02;
      introRenderer.render(scene, camera);
      if (!introReady) {
        introReady = true;
        intro.classList.add("has-webgl", "is-webgl-ready");
      }
      window.__b3IntroStats.frames += 1;
      window.__b3IntroStats.lastRotationY = group.rotation.y;
      if (window.__b3IntroStats.frames === 2 || window.__b3IntroStats.frames % 20 === 0) {
        sampleIntroFrame();
      }
      introAnimation = requestAnimationFrame(animateIntro);
    }

    resizeIntro();
    window.addEventListener("resize", resizeIntro, { passive: true });
    introAnimation = requestAnimationFrame(animateIntro);
  } catch (error) {
    closeIntro();
    return;
  }

  window.setTimeout(closeIntro, 1500);
}

introSkip?.addEventListener("click", closeIntro);
intro?.addEventListener("wheel", (event) => {
  if (event.deltaY > 4) closeIntro();
}, { passive: true });

let introTouchStartY = 0;
intro?.addEventListener("touchstart", (event) => {
  introTouchStartY = event.touches[0]?.clientY ?? 0;
}, { passive: true });
intro?.addEventListener("touchmove", (event) => {
  const currentY = event.touches[0]?.clientY ?? introTouchStartY;
  if (introTouchStartY - currentY > 18) closeIntro();
}, { passive: true });

window.addEventListener("keydown", (event) => {
  if (!introClosed && ["ArrowDown", "PageDown", " "].includes(event.key)) closeIntro();
});
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initIntro, { once: true });
} else {
  initIntro();
}
window.setTimeout(closeIntro, 3000);
