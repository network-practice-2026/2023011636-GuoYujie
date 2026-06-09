const knowledgeList = document.querySelector("#knowledgeList");
const layerOrder = ["应用层", "传输层", "网络层", "数据链路层", "物理层"];
const autoplayTiming = {
  dns: 1600,
  tcp: 1800,
  scenario: 2200,
  arp: 1700,
  switching: 1700,
};
let currentLayerIndex = 0;
let currentSearch = "";
let pendingGraphFocusId = null;
let showEnglish = false;

const englishTerms = {
  计算机网络: "Computer Network",
  应用层: "Application Layer",
  传输层: "Transport Layer",
  网络层: "Network Layer",
  数据链路层: "Data Link Layer",
  物理层: "Physical Layer",
  协议: "Protocol",
  设备: "Device",
  技术: "Technology",
  机制: "Mechanism",
  概念: "Concept",
  数据结构: "Data Structure",
  数据单位: "Data Unit",
  介质: "Medium",
  HTTP: "HyperText Transfer Protocol",
  HTTPS: "HyperText Transfer Protocol Secure",
  DNS: "Domain Name System",
  FTP: "File Transfer Protocol",
  SMTP: "Simple Mail Transfer Protocol",
  DHCP: "Dynamic Host Configuration Protocol",
  WebSocket: "WebSocket",
  TCP: "Transmission Control Protocol",
  UDP: "User Datagram Protocol",
  IP: "Internet Protocol",
  ICMP: "Internet Control Message Protocol",
  ARP: "Address Resolution Protocol",
  NAT: "Network Address Translation",
  Ethernet: "Ethernet",
  VLAN: "Virtual Local Area Network",
  PPP: "Point-to-Point Protocol",
  "Socket 编程接口": "Socket Programming Interface",
  端口号: "Port Number",
  滑动窗口: "Sliding Window",
  拥塞控制: "Congestion Control",
  三次握手: "Three-way Handshake",
  四次挥手: "Four-way Termination",
  "IPv4 地址": "IPv4 Address",
  "IPv6 地址": "IPv6 Address",
  路由器: "Router",
  路由表: "Routing Table",
  以太网帧: "Ethernet Frame",
  "MAC 地址": "MAC Address",
  交换机: "Switch",
  "MAC 地址表": "MAC Address Table",
  差错检测: "Error Detection",
  比特流: "Bit Stream",
  双绞线: "Twisted Pair",
  光纤: "Optical Fiber",
  无线信道: "Wireless Channel",
  集线器: "Hub",
  带宽: "Bandwidth",
  编码与调制: "Encoding and Modulation",
};

const layerProfiles = {
  应用层: {
    order: "第 5 层",
    intro: "应用层直接面向用户程序，负责把网络能力包装成浏览器访问、文件传输、邮件收发、域名解析等具体服务。",
    function: "定义应用进程之间如何交换数据，规定请求格式、响应格式、认证方式和应用语义。",
    protocols: "HTTP、HTTPS、DNS、FTP、SMTP、DHCP、WebSocket",
    units: "应用层报文、域名、URL、文件、邮件",
    relation: "向下依赖传输层提供端到端通信能力，向上服务浏览器、邮件客户端、文件传输工具等应用。",
  },
  传输层: {
    order: "第 4 层",
    intro: "传输层位于应用层和网络层之间，负责把主机到主机的通信进一步细化为进程到进程的通信。",
    function: "提供端口复用、可靠传输、流量控制、拥塞控制或低开销无连接传输。",
    protocols: "TCP、UDP、QUIC 相关传输机制、端口号、滑动窗口",
    units: "TCP 报文段、UDP 用户数据报、端口",
    relation: "向上承载应用层报文，向下把数据交给网络层封装为 IP 数据报。",
  },
  网络层: {
    order: "第 3 层",
    intro: "网络层负责让数据跨越多个网络到达目标主机，是互联网能够互联互通的关键层。",
    function: "完成逻辑寻址、路由选择、分组转发、差错报告和跨网段通信。",
    protocols: "IP、ICMP、ARP 辅助寻址、NAT、路由协议",
    units: "IP 数据报、IP 地址、路由表、下一跳",
    relation: "向上服务传输层，向下把 IP 数据报交给数据链路层在下一段链路上传输。",
  },
  数据链路层: {
    order: "第 2 层",
    intro: "数据链路层关注同一链路或局域网内的数据传输，负责把网络层数据报封装成帧。",
    function: "完成成帧、MAC 寻址、交换机转发、差错检测和局域网广播控制。",
    protocols: "Ethernet、ARP、VLAN、PPP、MAC 地址学习",
    units: "以太网帧、MAC 地址、FCS、交换表",
    relation: "向上承载 IP 数据报，向下依赖物理层把帧中的比特实际发送出去。",
  },
  物理层: {
    order: "第 1 层",
    intro: "物理层是网络体系结构的最底层，负责把比特转换为能在介质上传播的信号。",
    function: "规定接口、电气特性、光学特性、编码方式、传输速率和传输介质。",
    protocols: "以太网物理规范、Wi-Fi 物理层、光纤传输、编码与调制",
    units: "比特、电信号、光信号、无线电波、带宽",
    relation: "向上为数据链路层提供透明的比特传输能力，是所有上层通信的物理基础。",
  },
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }
  return response.json();
}

async function sendJson(url, method, payload) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `请求失败：${response.status}`);
  }
  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function withEnglish(value) {
  const text = String(value || "");
  const english = englishTerms[text];
  return showEnglish && english ? `${text}（${english}）` : text;
}

function annotateEnglishText(value) {
  let text = String(value || "");
  if (!showEnglish) return text;
  Object.entries(englishTerms)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([chinese, english]) => {
      const escaped = chinese.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(new RegExp(escaped, "g"), (match, offset, source) => {
        const next = source.slice(offset + match.length, offset + match.length + english.length + 2);
        return next === `（${english}）` ? match : `${match}（${english}）`;
      });
    });
  return text;
}

function updateEnglishToggleButtons() {
  document.querySelectorAll(".english-toggle").forEach((button) => {
    button.textContent = showEnglish ? "隐藏英文" : "显示英文";
    button.classList.toggle("active", showEnglish);
  });
}

function renderKnowledge(items) {
  knowledgeList.innerHTML = items
    .map(
      (item) => `
        <article class="knowledge-card">
          <div class="card-head">
            <span class="tag">${escapeHtml(withEnglish(item.layer))} · ${escapeHtml(withEnglish(item.category))}</span>
            <div class="card-actions">
              <button type="button" data-action="graph" data-id="${item.id}">图谱查看</button>
              <button type="button" data-action="edit" data-id="${item.id}">编辑</button>
              <button type="button" data-action="delete" data-id="${item.id}">删除</button>
            </div>
          </div>
          <h3>${escapeHtml(withEnglish(item.title))}</h3>
          <p>${escapeHtml(annotateEnglishText(item.summary))}</p>
          <p>${escapeHtml(annotateEnglishText(item.detail))}</p>
          <p class="muted">设备或数据单位：${escapeHtml(withEnglish(item.device_or_unit || "无"))}</p>
        </article>
      `
    )
    .join("");
  knowledgeList.querySelectorAll("button[data-action='edit']").forEach((button) => {
    button.addEventListener("click", () => {
      const item = items.find((entry) => String(entry.id) === button.dataset.id);
      fillKnowledgeForm(item);
    });
  });
  knowledgeList.querySelectorAll("button[data-action='graph']").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.hash = "#graph";
      pendingGraphFocusId = button.dataset.id;
      window.setTimeout(() => window.focusKnowledgeGraphItem?.(button.dataset.id), 160);
    });
  });
  knowledgeList.querySelectorAll("button[data-action='delete']").forEach((button) => {
    button.addEventListener("click", () => deleteKnowledge(button.dataset.id));
  });
}

async function loadKnowledge(layer, q = "") {
  currentSearch = q;
  const encodedLayer = encodeURIComponent(layer);
  const encodedQuery = encodeURIComponent(q);
  const data = await fetchJson(`/api/knowledge?layer=${encodedLayer}&q=${encodedQuery}&page_size=50`);
  renderKnowledge(data.items);
  document.querySelector("#knowledgeCount").textContent = `${withEnglish(layer)}知识点：${data.total} 条`;
}

async function exportKnowledgeJson() {
  const button = document.querySelector("#exportKnowledge");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "导出中...";
  try {
    const data = await fetchJson("/api/knowledge?page_size=500");
    const payload = {
      project: "计算机网络知识体系交互式展示系统",
      student: {
        id: "2023011636",
        name: "郭宇杰",
      },
      exported_at: new Date().toISOString(),
      total: data.total,
      layers: layerOrder,
      items: data.items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `network-knowledge-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    button.textContent = "已导出";
    window.setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1200);
  } catch (error) {
    button.textContent = "导出失败";
    document.querySelector("#knowledgeMessage").textContent = error.message;
    window.setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1600);
  }
}

function highlightKnowledgeCard(title) {
  window.setTimeout(() => {
    const cards = [...document.querySelectorAll(".knowledge-card")];
    const card = cards.find((item) => item.querySelector("h3")?.textContent === withEnglish(title));
    if (!card) return;
    card.classList.remove("linked-highlight");
    card.getBoundingClientRect();
    card.classList.add("linked-highlight");
    card.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 350);
}

function openGraphNodeInKnowledge(node) {
  if (!node || !node.layer || !layerOrder.includes(node.layer)) {
    return;
  }
  window.location.hash = "#knowledge";
  const layerIndex = layerOrder.indexOf(node.layer);
  currentLayerIndex = layerIndex;
  renderLayerProfile(node.layer);
  setFormLayer(node.layer);
  const searchInput = document.querySelector("#knowledgeSearch");
  if (node.level === 2) {
    const rawTitle = node.rawName || node.name;
    searchInput.value = rawTitle;
    loadKnowledge(node.layer, rawTitle).then(() => highlightKnowledgeCard(rawTitle));
  } else {
    searchInput.value = "";
    loadKnowledge(node.layer);
  }
}

function currentLayer() {
  return layerOrder[currentLayerIndex];
}

function renderLayerProfile(layer, direction = "down") {
  const profile = layerProfiles[layer];
  const content = document.querySelector("#layerContent");
  content.classList.remove("slide-up", "slide-down");
  content.getBoundingClientRect();
  content.classList.add(direction === "up" ? "slide-up" : "slide-down");
  document.querySelector("#layerOrder").textContent = profile.order;
  document.querySelector("#layerTitle").textContent = withEnglish(layer);
  document.querySelector("#layerIntro").textContent = profile.intro;
  document.querySelector("#layerFunction").textContent = profile.function;
  document.querySelector("#layerProtocols").textContent = annotateEnglishText(profile.protocols);
  document.querySelector("#layerUnits").textContent = annotateEnglishText(profile.units);
  document.querySelector("#layerRelation").textContent = annotateEnglishText(profile.relation);
  document.querySelectorAll(".layer-node").forEach((node) => {
    node.classList.toggle("active", node.dataset.layer === layer);
    node.querySelector("[data-layer-label]").textContent = withEnglish(node.dataset.layer);
  });
}

function switchLayer(nextIndex) {
  const boundedIndex = Math.max(0, Math.min(layerOrder.length - 1, nextIndex));
  const direction = boundedIndex > currentLayerIndex ? "down" : "up";
  currentLayerIndex = boundedIndex;
  const layer = layerOrder[currentLayerIndex];
  const searchInput = document.querySelector("#knowledgeSearch");
  searchInput.value = "";
  currentSearch = "";
  renderLayerProfile(layer, direction);
  setFormLayer(layer);
  loadKnowledge(layer);
}

function refreshFormLayerOptions() {
  const selectedFormLayer = document.querySelector("#formLayer").value || currentLayer();
  document.querySelector("#formLayer").innerHTML = layerOrder
    .map((layer) => `<option value="${layer}">${withEnglish(layer)}</option>`)
    .join("");
  document.querySelector("#formLayer").value = selectedFormLayer;
}

function refreshEnglishDisplay() {
  refreshFormLayerOptions();
  renderLayerProfile(currentLayer());
  loadKnowledge(currentLayer(), currentSearch);
  updateEnglishToggleButtons();
  window.refreshKnowledgeGraph?.();
}

function toggleEnglishDisplay() {
  showEnglish = !showEnglish;
  refreshEnglishDisplay();
}

function setupKnowledgeLibrary() {
  refreshFormLayerOptions();
  document.querySelectorAll(".layer-node").forEach((node) => {
    node.addEventListener("click", () => {
      switchLayer(layerOrder.indexOf(node.dataset.layer));
    });
  });
  document.querySelector("#prevLayer").addEventListener("click", () => switchLayer(currentLayerIndex - 1));
  document.querySelector("#nextLayer").addEventListener("click", () => switchLayer(currentLayerIndex + 1));
  document.querySelector("#knowledgeSearch").addEventListener("input", (event) => {
    loadKnowledge(currentLayer(), event.target.value.trim());
  });
  document.querySelector("#knowledgeForm").addEventListener("submit", saveKnowledge);
  document.querySelector("#cancelEdit").addEventListener("click", resetKnowledgeForm);
  document.querySelector("#exportKnowledge").addEventListener("click", exportKnowledgeJson);
  document.querySelector("#knowledgeEnglishToggle").addEventListener("click", toggleEnglishDisplay);
  document.querySelector("#graphEnglishToggle").addEventListener("click", toggleEnglishDisplay);
  renderLayerProfile(currentLayer());
  setFormLayer(currentLayer());
  loadKnowledge(currentLayer());
  updateEnglishToggleButtons();
}

function setupCatalogActiveState() {
  const links = [...document.querySelectorAll(".catalog a[data-section]")];
  const pageSections = [...document.querySelectorAll(".page-section")];
  const routeIds = new Set(["overview", "protocols", "scenario", "knowledge", "graph"]);

  function showPage(sectionId) {
    const current = routeIds.has(sectionId) ? sectionId : "overview";
    document.body.classList.add("route-ready");
    links.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === current);
    });
    pageSections.forEach((section) => {
      const shouldShow = section.id === current || (current === "overview" && section.id === "summary");
      section.classList.toggle("page-visible", shouldShow);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function updatePageFromHash() {
    showPage((window.location.hash || "#overview").replace("#", ""));
  }

  window.addEventListener("hashchange", updatePageFromHash);
  updatePageFromHash();
}

async function setupKnowledgeGraph() {
  const svg = document.querySelector("#knowledgeGraph");
  const detailType = document.querySelector("#graphNodeType");
  const detailTitle = document.querySelector("#graphNodeTitle");
  const detailSummary = document.querySelector("#graphNodeSummary");
  const detailLayer = document.querySelector("#graphNodeLayer");
  const detailCategory = document.querySelector("#graphNodeCategory");
  const detailUnit = document.querySelector("#graphNodeUnit");
  const detailRelation = document.querySelector("#graphNodeRelation");
  const all = await fetchJson("/api/knowledge?page_size=50");
  const layerPositions = {
    应用层: [490, 95],
    传输层: [770, 250],
    网络层: [660, 520],
    数据链路层: [320, 520],
    物理层: [210, 250],
  };
  const categoryColors = {
    协议: "#2563eb",
    设备: "#147d64",
    技术: "#7c3aed",
    机制: "#a15c07",
    概念: "#be123c",
    数据结构: "#0f766e",
    数据单位: "#4f46e5",
    介质: "#6b7280",
  };
  const nodes = [
    {
      id: "root",
      title: "计算机网络",
      type: "知识体系",
      layer: "整体",
      category: "根节点",
      unit: "五层模型",
      summary: "由应用层、传输层、网络层、数据链路层、物理层协作完成端到端通信。",
      relation: "顶层节点向下连接 TCP/IP 五层模型。",
      x: 490,
      y: 310,
      r: 52,
      color: "#111827",
      level: 0,
      parent: null,
    },
  ];
  const links = [];

  layerOrder.forEach((layer) => {
    const [x, y] = layerPositions[layer];
    const profile = layerProfiles[layer];
    nodes.push({
      id: `layer-${layer}`,
      title: layer,
      type: profile.order,
      layer,
      category: "网络层级",
      unit: profile.units,
      summary: profile.intro,
      relation: profile.relation,
      x,
      y,
      r: 34,
      color: "#2563eb",
      level: 1,
      parent: "root",
    });
    links.push({ source: "root", target: `layer-${layer}`, label: "包含" });
  });

  layerOrder.forEach((layer) => {
    const items = all.items.filter((item) => item.layer === layer).slice(0, 7);
    const [cx, cy] = layerPositions[layer];
    const radius = 112;
    items.forEach((item, index) => {
      const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      nodes.push({
        id: `item-${item.id}`,
        title: item.title,
        type: item.category,
        layer: item.layer,
        category: item.category,
        unit: item.device_or_unit || "无",
        summary: item.summary,
        detail: item.detail,
        relation: `${item.title} 属于 ${item.layer}，与该层的功能和数据封装过程相关。`,
        x,
        y,
        r: 22,
        color: categoryColors[item.category] || "#475569",
        level: 2,
        parent: `layer-${layer}`,
      });
      links.push({ source: `layer-${layer}`, target: `item-${item.id}`, label: item.category });
    });
  });

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  nodes.forEach((node) => {
    node.baseX = node.x;
    node.baseY = node.y;
    node.vx = 0;
    node.vy = 0;
  });
  const linkElements = [];
  const nodeGroups = new Map();
  let draggingNode = null;
  let focusedNode = nodeMap.get("root");
  let inertiaFrame = null;
  let suppressNextClick = false;

  function drawGraph() {
    svg.innerHTML = "";
    linkElements.length = 0;
    nodeGroups.clear();
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    links.forEach((link) => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      const line = createSvg("line", {
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        class: "graph-link",
      });
      linkElements.push({ link, line });
      svg.appendChild(line);
    });

    nodes.forEach((node, index) => {
      const group = createSvg("g", {
        class: `graph-node ${node.id === "root" ? "root-node" : ""}`,
        transform: `translate(${node.x} ${node.y})`,
        style: `--delay:${index * 18}ms`,
      });
      const circle = createSvg("circle", {
        r: node.r,
        fill: node.color,
      });
      const label = createSvg("text", {
        "text-anchor": "middle",
        y: node.r + 17,
        class: "graph-label",
      });
      label.textContent = node.title;
      group.appendChild(circle);
      group.appendChild(label);
      group.addEventListener("click", () => {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }
        selectGraphNode(node, group, true);
      });
      group.addEventListener("pointerdown", (event) => startDrag(event, node, group));
      nodeGroups.set(node.id, group);
      svg.appendChild(group);
    });
    updateVisibility();
  }

  function selectGraphNode(node, group, shouldFocus = false) {
    svg.querySelectorAll(".graph-node").forEach((item) => item.classList.remove("selected"));
    group.classList.add("selected");
    focusedNode = node;
    if (shouldFocus) {
      arrangeFocus(node);
      updateVisibility();
    }
    detailType.textContent = node.type;
    detailTitle.textContent = node.title;
    detailSummary.textContent = node.detail || node.summary;
    detailLayer.textContent = node.layer;
    detailCategory.textContent = node.category;
    detailUnit.textContent = node.unit;
    detailRelation.textContent = node.relation;
  }

  function createSvg(name, attrs) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function startDrag(event, node, group) {
    event.preventDefault();
    if (inertiaFrame) {
      cancelAnimationFrame(inertiaFrame);
    }
    draggingNode = { node, group };
    draggingNode.lastX = node.x;
    draggingNode.lastY = node.y;
    draggingNode.lastTime = performance.now();
    draggingNode.startX = node.x;
    draggingNode.startY = node.y;
    draggingNode.hasMoved = false;
    group.classList.add("dragging");
    svg.setPointerCapture(event.pointerId);
    selectGraphNode(node, group, false);
  }

  function moveDrag(event) {
    if (!draggingNode) {
      return;
    }
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
    const now = performance.now();
    const nextX = Math.max(40, Math.min(940, svgPoint.x));
    const nextY = Math.max(40, Math.min(580, svgPoint.y));
    if (Math.abs(nextX - draggingNode.startX) + Math.abs(nextY - draggingNode.startY) > 8) {
      draggingNode.hasMoved = true;
    }
    const dt = Math.max(now - draggingNode.lastTime, 16);
    draggingNode.node.vx = ((nextX - draggingNode.lastX) / dt) * 8;
    draggingNode.node.vy = ((nextY - draggingNode.lastY) / dt) * 8;
    draggingNode.lastX = nextX;
    draggingNode.lastY = nextY;
    draggingNode.lastTime = now;
    setNodePosition(draggingNode.node, nextX, nextY);
    updateGraphLinks();
  }

  function stopDrag(event) {
    if (!draggingNode) {
      return;
    }
    draggingNode.group.classList.remove("dragging");
    if (svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
    const released = draggingNode.node;
    suppressNextClick = draggingNode.hasMoved;
    draggingNode = null;
    if (suppressNextClick) {
      startInertia(released);
    }
  }

  function updateGraphLinks() {
    linkElements.forEach(({ link, line }) => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      line.setAttribute("x1", source.x);
      line.setAttribute("y1", source.y);
      line.setAttribute("x2", target.x);
      line.setAttribute("y2", target.y);
    });
  }

  function setNodePosition(node, x, y) {
    node.x = Math.max(40, Math.min(940, x));
    node.y = Math.max(40, Math.min(580, y));
    const group = nodeGroups.get(node.id);
    if (group) {
      group.setAttribute("transform", `translate(${node.x} ${node.y})`);
    }
  }

  function getVisibleNodeIds() {
    const depthValue = document.querySelector("#graphDepth").value;
    if (depthValue === "all") {
      return new Set(nodes.map((node) => node.id));
    }
    const depth = Number(depthValue);
    const visible = new Set([focusedNode.id]);
    if (focusedNode.id !== "root") {
      let parentId = focusedNode.parent;
      while (parentId) {
        visible.add(parentId);
        parentId = nodeMap.get(parentId)?.parent;
      }
    }
    if (focusedNode.id === "root") {
      nodes.forEach((node) => {
        if (node.level <= depth) visible.add(node.id);
      });
      return visible;
    }
    if (focusedNode.level === 1 && depth >= 2) {
      nodes.forEach((node) => {
        if (node.parent === focusedNode.id) visible.add(node.id);
      });
    }
    if (focusedNode.level === 0 && depth >= 1) {
      nodes.forEach((node) => {
        if (node.parent === "root") visible.add(node.id);
      });
    }
    return visible;
  }

  function updateVisibility() {
    const visible = getVisibleNodeIds();
    nodeGroups.forEach((group, id) => {
      group.classList.toggle("hidden", !visible.has(id));
      group.classList.toggle("dimmed", visible.has(id) && focusedNode.id !== "root" && id !== focusedNode.id && nodeMap.get(id)?.parent !== focusedNode.id && nodeMap.get(focusedNode.parent)?.id !== id);
    });
    linkElements.forEach(({ link, line }) => {
      const show = visible.has(link.source) && visible.has(link.target);
      line.classList.toggle("hidden", !show);
      line.classList.toggle("emphasis", show && (link.source === focusedNode.id || link.target === focusedNode.id));
    });
  }

  function arrangeFocus(node) {
    const targets = new Map();
    if (node.id === "root") {
      nodes.forEach((item) => targets.set(item.id, [item.baseX, item.baseY]));
      animateToTargets(targets);
      return;
    }
    targets.set(node.id, [490, 310]);
    const ancestors = [];
    let parentId = node.parent;
    while (parentId) {
      ancestors.push(nodeMap.get(parentId));
      parentId = nodeMap.get(parentId)?.parent;
    }
    ancestors.forEach((ancestor, index) => {
      targets.set(ancestor.id, [490 - (index + 1) * 135, 310]);
    });
    const children = nodes.filter((item) => item.parent === node.id);
    children.forEach((child, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(children.length, 1) - Math.PI / 2;
      targets.set(child.id, [490 + Math.cos(angle) * 185, 310 + Math.sin(angle) * 155]);
    });
    nodes.forEach((item) => {
      if (!targets.has(item.id)) {
        targets.set(item.id, [item.baseX, item.baseY]);
      }
    });
    animateToTargets(targets);
  }

  function animateToTargets(targets) {
    const start = performance.now();
    const duration = 520;
    const initial = new Map(nodes.map((node) => [node.id, [node.x, node.y]]));
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      nodes.forEach((node) => {
        const [sx, sy] = initial.get(node.id);
        const [tx, ty] = targets.get(node.id);
        setNodePosition(node, sx + (tx - sx) * eased, sy + (ty - sy) * eased);
      });
      updateGraphLinks();
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function startInertia(node) {
    function frame() {
      node.vx *= 0.72;
      node.vy *= 0.72;
      setNodePosition(node, node.x + node.vx, node.y + node.vy);
      updateGraphLinks();
      if (Math.abs(node.vx) + Math.abs(node.vy) > 0.35) {
        inertiaFrame = requestAnimationFrame(frame);
      }
    }
    inertiaFrame = requestAnimationFrame(frame);
  }

  document.querySelector("#fitGraph").addEventListener("click", () => {
    svg.setAttribute("viewBox", "0 0 980 620");
    focusedNode = nodeMap.get("root");
    nodes.forEach((node) => {
      node.x = node.baseX;
      node.y = node.baseY;
      node.vx = 0;
      node.vy = 0;
    });
    drawGraph();
  });
  document.querySelector("#showAllGraph").addEventListener("click", () => {
    document.querySelector("#graphDepth").value = "all";
    focusedNode = nodeMap.get("root");
    arrangeFocus(focusedNode);
    updateVisibility();
  });
  document.querySelector("#graphDepth").addEventListener("change", updateVisibility);
  document.querySelector("#pulseGraph").addEventListener("click", () => {
    svg.classList.remove("pulse-relations");
    svg.getBoundingClientRect();
    svg.classList.add("pulse-relations");
  });
  svg.addEventListener("pointermove", moveDrag);
  svg.addEventListener("pointerup", stopDrag);
  svg.addEventListener("pointerleave", stopDrag);
  drawGraph();
}

function setFormLayer(layer) {
  document.querySelector("#formLayer").value = layer;
}

function fillKnowledgeForm(item) {
  document.querySelector("#knowledgeId").value = item.id;
  document.querySelector("#formLayer").value = item.layer;
  document.querySelector("#formTitleInput").value = item.title;
  document.querySelector("#formCategory").value = item.category;
  document.querySelector("#formUnit").value = item.device_or_unit || "";
  document.querySelector("#formSummary").value = item.summary;
  document.querySelector("#formDetail").value = item.detail;
  document.querySelector("#formTitle").textContent = "编辑知识点";
  document.querySelector("#saveKnowledge").textContent = "保存修改";
  document.querySelector("#knowledgeMessage").textContent = `正在编辑：${item.title}`;
  document.querySelector("#knowledgeForm").scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetKnowledgeForm() {
  document.querySelector("#knowledgeId").value = "";
  document.querySelector("#formTitleInput").value = "";
  document.querySelector("#formCategory").value = "";
  document.querySelector("#formUnit").value = "";
  document.querySelector("#formSummary").value = "";
  document.querySelector("#formDetail").value = "";
  document.querySelector("#formTitle").textContent = "新增知识点";
  document.querySelector("#saveKnowledge").textContent = "保存知识点";
  document.querySelector("#knowledgeMessage").textContent = "";
  setFormLayer(currentLayer());
}

function readKnowledgeForm() {
  return {
    layer: document.querySelector("#formLayer").value,
    title: document.querySelector("#formTitleInput").value,
    category: document.querySelector("#formCategory").value,
    device_or_unit: document.querySelector("#formUnit").value,
    summary: document.querySelector("#formSummary").value,
    detail: document.querySelector("#formDetail").value,
  };
}

async function saveKnowledge(event) {
  event.preventDefault();
  const id = document.querySelector("#knowledgeId").value;
  const message = document.querySelector("#knowledgeMessage");
  try {
    const payload = readKnowledgeForm();
    if (id) {
      await sendJson(`/api/knowledge/${id}`, "PUT", payload);
      message.textContent = "修改已保存，并写入数据库";
    } else {
      await sendJson("/api/knowledge", "POST", payload);
      message.textContent = "新增成功，并写入数据库";
    }
    const nextIndex = layerOrder.indexOf(payload.layer);
    currentLayerIndex = nextIndex >= 0 ? nextIndex : currentLayerIndex;
    renderLayerProfile(currentLayer());
    document.querySelector("#knowledgeSearch").value = "";
    await loadKnowledge(currentLayer());
    await window.refreshKnowledgeGraph?.();
    resetKnowledgeForm();
  } catch (error) {
    message.textContent = error.message;
  }
}

async function deleteKnowledge(id) {
  const message = document.querySelector("#knowledgeMessage");
  try {
    await sendJson(`/api/knowledge/${id}`, "DELETE");
    message.textContent = "删除成功，数据库已更新";
    await loadKnowledge(currentLayer(), currentSearch);
    await window.refreshKnowledgeGraph?.();
  } catch (error) {
    message.textContent = error.message;
  }
}

function setupProtocolTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".protocol-panel").forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`#${tab.dataset.protocol}Panel`).classList.add("active");
    });
  });
}

function setupScenarioFramework() {
  const mac = {
    h1: "00-11-22-33-44-cc",
    dns: "00-11-22-33-44-bb",
    router: "00-11-22-33-44-aa",
    h2: "00-11-22-33-44-dd",
    broadcast: "ff-ff-ff-ff-ff-ff",
  };
  const ip = {
    h1: "192.168.1.2",
    dns: "192.168.1.126",
    router: "192.168.1.1",
    web: "203.0.113.10",
    externalDns: "198.51.100.53",
  };
  const tableState = {
    empty: { arp: [], mac: [] },
    h1Known: { arp: [], mac: [[mac.h1, "4"]] },
    dnsKnown: { arp: [[ip.dns, mac.dns]], mac: [[mac.h1, "4"], [mac.dns, "1"]] },
    dnsRouterKnown: { arp: [[ip.dns, mac.dns]], mac: [[mac.h1, "4"], [mac.dns, "1"], [mac.router, "2"]] },
    routerKnown: { arp: [[ip.dns, mac.dns], [ip.router, mac.router]], mac: [[mac.h1, "4"], [mac.dns, "1"], [mac.router, "2"]] },
  };
  const frameworkSteps = [
    {
      title: "步骤 1：H1 广播询问本地域名服务器的 MAC",
      text: "t0 时刻 H1 要访问 www.abc.com，但 H1 的 ARP 表为空。由于本地域名服务器 192.168.1.126 与 H1 同网段，H1 先广播 ARP Request。",
      protocol: "ARP",
      cast: "广播",
      source: "H1",
      target: "本地域名服务器 IP",
      srcMac: mac.h1,
      dstMac: mac.broadcast,
      srcIp: ip.h1,
      dstIp: ip.dns,
      paths: ["switch-h1", "dns-switch", "switch-h2", "router-switch"],
      devices: ["h1", "switch", "dns", "router", "h2"],
      packetFrom: "h1",
      packetTo: "switch",
      packetRoute: ["h1", "switch"],
      floodTargets: ["dns", "router", "h2"],
      switchAction: "S 学习 H1 的 MAC 位于端口 4；ARP Request 为广播帧，因此向端口 1、2、3 泛洪。",
      tables: tableState.h1Known,
    },
    {
      title: "步骤 2：本地域名服务器单播 ARP 应答",
      text: "本地域名服务器收到广播后，发现被询问的是自己的 IP，于是向 H1 单播 ARP Reply，告知自己的 MAC 地址。",
      protocol: "ARP",
      cast: "单播",
      source: "本地域名服务器",
      target: "H1",
      srcMac: mac.dns,
      dstMac: mac.h1,
      srcIp: ip.dns,
      dstIp: ip.h1,
      paths: ["switch-h1", "dns-switch"],
      devices: ["dns", "switch", "h1"],
      packetFrom: "dns",
      packetTo: "h1",
      packetRoute: ["dns", "switch", "h1"],
      switchAction: "S 从端口 1 收到应答帧，学习本地域名服务器 MAC 位于端口 1；目的 MAC 为 H1，已知在端口 4，因此定向转发。",
      tables: tableState.dnsKnown,
    },
    {
      title: "步骤 3：H1 向本地域名服务器发送 DNS 查询",
      text: "H1 已知道本地域名服务器的 MAC，发送 DNS Query 查询 www.abc.com 对应的 IP 地址。",
      protocol: "DNS",
      cast: "单播",
      source: "H1",
      target: "本地域名服务器",
      srcMac: mac.h1,
      dstMac: mac.dns,
      srcIp: ip.h1,
      dstIp: ip.dns,
      paths: ["switch-h1", "dns-switch"],
      devices: ["h1", "switch", "dns"],
      packetFrom: "h1",
      packetTo: "dns",
      packetRoute: ["h1", "switch", "dns"],
      switchAction: "S 从端口 4 收到单播帧，目的 MAC 为本地域名服务器，交换表已知端口 1，直接转发到端口 1。",
      tables: tableState.dnsKnown,
    },
    {
      title: "步骤 4：本地域名服务器广播询问默认网关 R 的 MAC",
      text: "本地域名服务器收到 H1 的查询后，若本地没有 www.abc.com 的缓存结果，需要向 Internet 侧 DNS 继续查询。由于目的地址在外网，它也需要先知道默认网关 R 的 MAC。",
      protocol: "ARP",
      cast: "广播",
      source: "本地域名服务器",
      target: "路由器 R IP",
      srcMac: mac.dns,
      dstMac: mac.broadcast,
      srcIp: ip.dns,
      dstIp: ip.router,
      paths: ["dns-switch", "switch-h1", "switch-h2", "router-switch"],
      devices: ["dns", "switch", "h1", "router", "h2"],
      packetFrom: "dns",
      packetTo: "switch",
      packetRoute: ["dns", "switch"],
      floodTargets: ["h1", "router", "h2"],
      switchAction: "S 从端口 1 收到 DNS 服务器发出的 ARP 广播，刷新/确认 DNS MAC 位于端口 1，并向端口 2、3、4 泛洪。",
      dns: "外部查询准备中",
      tables: tableState.dnsKnown,
    },
    {
      title: "步骤 5：路由器 R 向本地域名服务器返回 ARP 应答",
      text: "R 收到 DNS 服务器的 ARP Request 后，单播返回自己的 MAC 地址。此时交换机 S 会提前学到 R 的 MAC 位于端口 2。",
      protocol: "ARP",
      cast: "单播",
      source: "路由器 R",
      target: "本地域名服务器",
      srcMac: mac.router,
      dstMac: mac.dns,
      srcIp: ip.router,
      dstIp: ip.dns,
      paths: ["router-switch", "dns-switch"],
      devices: ["router", "switch", "dns"],
      packetFrom: "router",
      packetTo: "dns",
      packetRoute: ["router", "switch", "dns"],
      switchAction: "S 从端口 2 收到 R 的 ARP 应答，学习 R MAC 位于端口 2；目的 MAC 为 DNS 服务器，查表后转发到端口 1。",
      dns: "外部查询准备中",
      tables: tableState.dnsRouterKnown,
    },
    {
      title: "步骤 6：本地域名服务器向外部 DNS 发起查询",
      text: "本地域名服务器获得 R 的 MAC 后，把外部 DNS 查询封装成发往默认网关 R 的以太网帧，经 R 转入 Internet。",
      protocol: "DNS",
      cast: "单播",
      source: "本地域名服务器",
      target: "Internet 上的外部 DNS",
      srcMac: mac.dns,
      dstMac: mac.router,
      srcIp: ip.dns,
      dstIp: ip.externalDns,
      paths: ["dns-switch", "router-switch", "router-internet"],
      devices: ["dns", "switch", "router", "internet"],
      packetFrom: "dns",
      packetTo: "internet",
      packetRoute: ["dns", "switch", "router", "internet"],
      switchAction: "S 从端口 1 收到目的 MAC 为 R 的 DNS 查询帧，交换表已知 R 在端口 2，因此定向转发到端口 2。",
      dns: "正在向外部 DNS 查询",
      tables: tableState.dnsRouterKnown,
    },
    {
      title: "步骤 7：外部 DNS 结果经 R 返回本地域名服务器",
      text: "外部 DNS 返回 www.abc.com 的解析结果。进入本地以太网时，R 重新封装以太网帧：源 MAC 为 R，目的 MAC 为本地域名服务器。",
      protocol: "DNS",
      cast: "单播",
      source: "Internet 上的外部 DNS",
      target: "本地域名服务器",
      srcMac: mac.router,
      dstMac: mac.dns,
      srcIp: ip.externalDns,
      dstIp: ip.dns,
      paths: ["router-internet", "router-switch", "dns-switch"],
      devices: ["internet", "router", "switch", "dns"],
      packetFrom: "internet",
      packetTo: "dns",
      packetRoute: ["internet", "router", "switch", "dns"],
      switchAction: "S 从端口 2 收到 R 转发回来的 DNS 应答帧，目的 MAC 为 DNS 服务器，查表转发到端口 1。",
      dns: "外部 DNS 已返回 203.0.113.10",
      tables: tableState.dnsRouterKnown,
    },
    {
      title: "步骤 8：本地域名服务器返回 DNS 解析结果",
      text: "本地域名服务器将外部查询得到的结果返回给 H1，H1 得到 www.abc.com 的 IP 地址 203.0.113.10。",
      protocol: "DNS",
      cast: "单播",
      source: "本地域名服务器",
      target: "H1",
      srcMac: mac.dns,
      dstMac: mac.h1,
      srcIp: ip.dns,
      dstIp: ip.h1,
      paths: ["switch-h1", "dns-switch"],
      devices: ["dns", "switch", "h1"],
      packetFrom: "dns",
      packetTo: "h1",
      packetRoute: ["dns", "switch", "h1"],
      switchAction: "S 根据目的 MAC 将 DNS 应答从端口 1 转发到端口 4；交换表不发生新的变化。",
      dns: "www.abc.com -> 203.0.113.10",
      tables: tableState.dnsRouterKnown,
    },
    {
      title: "步骤 9：H1 广播询问默认网关 R 的 MAC",
      text: "Web 服务器 IP 不在 H1 所在网段内，后续访问必须先交给默认网关 R。H1 因此广播 ARP Request 查询 192.168.1.1 的 MAC。",
      protocol: "ARP",
      cast: "广播",
      source: "H1",
      target: "路由器 R IP",
      srcMac: mac.h1,
      dstMac: mac.broadcast,
      srcIp: ip.h1,
      dstIp: ip.router,
      paths: ["switch-h1", "dns-switch", "switch-h2", "router-switch"],
      devices: ["h1", "switch", "dns", "router", "h2"],
      packetFrom: "h1",
      packetTo: "switch",
      packetRoute: ["h1", "switch"],
      floodTargets: ["dns", "router", "h2"],
      switchAction: "S 此时已经通过 DNS 服务器的外部查询学到 R 在端口 2；但 H1 自己还不知道 R 的 MAC，所以仍需发 ARP 广播，S 向端口 1、2、3 泛洪。",
      dns: "www.abc.com -> 203.0.113.10",
      tables: tableState.dnsRouterKnown,
    },
    {
      title: "步骤 10：路由器 R 单播 ARP 应答",
      text: "R 收到 ARP Request 后，向 H1 返回 ARP Reply，H1 获得默认网关的 MAC 地址。",
      protocol: "ARP",
      cast: "单播",
      source: "路由器 R",
      target: "H1",
      srcMac: mac.router,
      dstMac: mac.h1,
      srcIp: ip.router,
      dstIp: ip.h1,
      paths: ["router-switch", "switch-h1"],
      devices: ["router", "switch", "h1"],
      packetFrom: "router",
      packetTo: "h1",
      packetRoute: ["router", "switch", "h1"],
      switchAction: "S 从端口 2 收到 R 的应答帧，确认/刷新 R 的 MAC 位于端口 2；目的 MAC 为 H1，转发到端口 4。",
      dns: "www.abc.com -> 203.0.113.10",
      tables: tableState.routerKnown,
    },
    {
      title: "步骤 11：H1 发送 TCP SYN",
      text: "H1 准备与 Web 服务器建立 TCP 连接。由于 Web 在 Internet 中，局域网内以太网帧的目的 MAC 是默认网关 R，而 IP 数据报的目的 IP 是 Web 服务器。",
      protocol: "TCP SYN",
      cast: "单播",
      source: "H1",
      target: "Web 服务器",
      srcMac: mac.h1,
      dstMac: mac.router,
      srcIp: ip.h1,
      dstIp: ip.web,
      paths: ["switch-h1", "router-switch", "router-internet", "internet-web"],
      devices: ["h1", "switch", "router", "internet", "web"],
      packetFrom: "h1",
      packetTo: "web",
      packetRoute: ["h1", "switch", "router", "internet", "web"],
      switchAction: "S 从端口 4 收到目的 MAC 为 R 的 TCP SYN 帧，查表后定向转发到端口 2。",
      dns: "www.abc.com -> 203.0.113.10",
      tcp: "SYN-SENT",
      tables: tableState.routerKnown,
    },
    {
      title: "步骤 12：Web 服务器返回 TCP SYN-ACK",
      text: "Web 服务器通过 Internet 和路由器 R 返回 SYN-ACK。进入局域网时，R 重新封装以太网帧：源 MAC 为 R，目的 MAC 为 H1。",
      protocol: "TCP SYN-ACK",
      cast: "单播",
      source: "Web 服务器",
      target: "H1",
      srcMac: mac.router,
      dstMac: mac.h1,
      srcIp: ip.web,
      dstIp: ip.h1,
      paths: ["internet-web", "router-internet", "router-switch", "switch-h1"],
      devices: ["web", "internet", "router", "switch", "h1"],
      packetFrom: "web",
      packetTo: "h1",
      packetRoute: ["web", "internet", "router", "switch", "h1"],
      switchAction: "S 从端口 2 收到 R 转来的 SYN-ACK 帧，目的 MAC 为 H1，查表后转发到端口 4。",
      dns: "www.abc.com -> 203.0.113.10",
      tcp: "已收到 SYN-ACK，等待发送 ACK",
      tables: tableState.routerKnown,
    },
    {
      title: "步骤 13：H1 发送 TCP ACK，连接建立",
      text: "H1 向 Web 服务器发送 ACK，TCP 三次握手完成。此时浏览器已经可以发送 HTTP 请求。",
      protocol: "TCP ACK",
      cast: "单播",
      source: "H1",
      target: "Web 服务器",
      srcMac: mac.h1,
      dstMac: mac.router,
      srcIp: ip.h1,
      dstIp: ip.web,
      paths: ["switch-h1", "router-switch", "router-internet", "internet-web"],
      devices: ["h1", "switch", "router", "internet", "web"],
      packetFrom: "h1",
      packetTo: "web",
      packetRoute: ["h1", "switch", "router", "internet", "web"],
      switchAction: "S 再次将目的 MAC 为 R 的帧从端口 4 转发到端口 2；交换表保持稳定。",
      dns: "www.abc.com -> 203.0.113.10",
      tcp: "ESTABLISHED",
      tables: tableState.routerKnown,
    },
    {
      title: "步骤 14：HTTP 请求帧到达 S，即 t1",
      text: "H1 将 HTTP 请求封装进 TCP 报文段、IP 数据报和以太网帧。t1 时刻，交换机 S 第一次收到封装 HTTP 请求报文的以太网帧。",
      protocol: "HTTP",
      cast: "单播",
      source: "H1",
      target: "交换机 S（t1 观察点），下一跳 R，最终目标 Web 服务器",
      srcMac: mac.h1,
      dstMac: mac.router,
      srcIp: ip.h1,
      dstIp: ip.web,
      paths: ["switch-h1"],
      devices: ["h1", "switch", "router", "web"],
      packetFrom: "h1",
      packetTo: "switch",
      packetRoute: ["h1", "switch"],
      switchAction: "t1 到达：S 从端口 4 收到源 MAC 为 H1、目的 MAC 为 R 的 HTTP 请求帧。按交换表，下一步会转发到端口 2，但题目观察点停在第一次收到该帧。",
      dns: "www.abc.com -> 203.0.113.10",
      tcp: "ESTABLISHED",
      tables: tableState.routerKnown,
      conclusion: "最终状态：H1 已完成 DNS 解析、获得 DNS 与默认网关 R 的 ARP 表项、与 Web 服务器完成 TCP 连接建立；t1 时刻 HTTP 请求帧第一次到达交换机 S。",
    },
  ];
  let index = -1;
  let packetAnimationTimers = [];
  let scenarioAutoplayTimer = null;
  const scenarioAutoButton = document.querySelector("#scenarioAuto");
  const scenarioStepSelect = document.querySelector("#scenarioStepSelect");
  const ids = {
    progress: "#scenarioProgress",
    stage: "#scenarioStage",
    title: "#scenarioStepTitle",
    text: "#scenarioStepText",
    source: "#scenarioSource",
    target: "#scenarioTarget",
    protocol: "#scenarioProtocol",
    cast: "#scenarioCast",
    srcMac: "#scenarioSrcMac",
    dstMac: "#scenarioDstMac",
    srcIp: "#scenarioSrcIp",
    dstIp: "#scenarioDstIp",
    switchAction: "#scenarioSwitchAction",
    arp: "#scenarioArpTable",
    mac: "#scenarioMacTable",
    dns: "#scenarioDnsResult",
    tcp: "#scenarioTcpState",
    conclusion: "#scenarioConclusion",
    encApp: "#encapsulationApp",
    encTransport: "#encapsulationTransport",
    encNetwork: "#encapsulationNetwork",
    encLink: "#encapsulationLink",
  };

  function setText(selector, value) {
    document.querySelector(selector).textContent = value;
  }

  function render() {
    const step = frameworkSteps[index];
    setText(ids.progress, `步骤 ${index + 1} / ${frameworkSteps.length}`);
    setText(ids.stage, step.title.split("：")[0]);
    setText(ids.title, step.title);
    setText(ids.text, step.text);
    setText(ids.source, step.source);
    setText(ids.target, step.target);
    setText(ids.protocol, step.protocol);
    setText(ids.cast, step.cast);
    setText(ids.srcMac, step.srcMac);
    setText(ids.dstMac, step.dstMac);
    setText(ids.srcIp, step.srcIp);
    setText(ids.dstIp, step.dstIp);
    setText(ids.switchAction, step.switchAction);
    setText(ids.dns, step.dns || "未完成");
    setText(ids.tcp, step.tcp || "未建立");
    setText(ids.conclusion, step.conclusion || "尚未到达 t1");
    scenarioStepSelect.value = String(index);
    renderTables(step.tables);
    renderEncapsulation(step);
    renderScenarioPath(step);
  }

  function encapsulationFor(step) {
    const protocol = step.protocol;
    if (protocol === "ARP") {
      return {
        app: "无",
        transport: "无",
        network: `ARP 查询/应答：${step.srcIp} -> ${step.dstIp}`,
        link: `Ethernet 帧：${step.srcMac} -> ${step.dstMac}`,
      };
    }
    if (protocol === "DNS") {
      return {
        app: "DNS 报文：域名查询或解析应答",
        transport: "UDP：通常使用 53 端口",
        network: `IP 数据报：${step.srcIp} -> ${step.dstIp}`,
        link: `Ethernet 帧：${step.srcMac} -> ${step.dstMac}`,
      };
    }
    if (protocol.startsWith("TCP")) {
      return {
        app: "无，正在建立 TCP 连接",
        transport: `${protocol} 报文段`,
        network: `IP 数据报：${step.srcIp} -> ${step.dstIp}`,
        link: `Ethernet 帧：${step.srcMac} -> ${step.dstMac}`,
      };
    }
    if (protocol === "HTTP") {
      return {
        app: "HTTP 请求报文",
        transport: "TCP 报文段：承载 HTTP 请求",
        network: `IP 数据报：${step.srcIp} -> ${step.dstIp}`,
        link: `Ethernet 帧：${step.srcMac} -> ${step.dstMac}`,
      };
    }
    return { app: "无", transport: "无", network: "无", link: "无" };
  }

  function renderEncapsulation(step) {
    const view = encapsulationFor(step);
    setText(ids.encApp, view.app);
    setText(ids.encTransport, view.transport);
    setText(ids.encNetwork, view.network);
    setText(ids.encLink, view.link);
  }

  function renderTables(tables = { arp: [], mac: [] }) {
    const arpRows = tables.arp || [];
    const macRows = tables.mac || [];
    document.querySelector(ids.arp).innerHTML = arpRows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join("") || `<tr><td colspan="2">空</td></tr>`;
    document.querySelector(ids.mac).innerHTML = macRows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join("") || `<tr><td colspan="2">空</td></tr>`;
  }

  function renderScenarioPath(step) {
    document.querySelectorAll(".scenario-css-line").forEach((path) => {
      path.classList.toggle("active", step.paths.includes(path.dataset.path));
    });
    document.querySelectorAll("[data-device]").forEach((device) => device.classList.remove("active", "broadcast"));
    (step.devices || []).forEach((key) => {
      document.querySelector(`[data-device="${key}"]`)?.classList.add("active");
    });
    if (step.cast.includes("广播")) {
      ["dns", "router", "h2"].forEach((key) => document.querySelector(`[data-device="${key}"]`)?.classList.add("broadcast"));
    }
    animateScenarioPacket(step);
  }

  function clearPacketAnimation() {
    packetAnimationTimers.forEach((timer) => window.clearTimeout(timer));
    packetAnimationTimers = [];
    document.querySelectorAll(".scenario-packet.clone").forEach((clone) => clone.remove());
  }

  function animateScenarioPacket(step) {
    const packet = document.querySelector("#scenarioPacket");
    const mapElement = document.querySelector("#scenarioMap");
    const map = mapElement.getBoundingClientRect();
    const pointOf = (key) => {
      const node = document.querySelector(`[data-device="${key}"]`);
      if (!node) return [map.width / 2, map.height / 2];
      const rect = node.getBoundingClientRect();
      return [rect.left - map.left + rect.width / 2 - 36, rect.top - map.top + rect.height / 2 - 17];
    };
    const route = step.packetRoute || [step.packetFrom, step.packetTo];
    const points = route.map(pointOf);
    const [startLeft, startTop] = points[0];
    clearPacketAnimation();
    packet.classList.remove("visible");
    packet.style.transition = "none";
    packet.style.left = `${startLeft}px`;
    packet.style.top = `${startTop}px`;
    packet.textContent = step.protocol.replace("TCP ", "");
    packet.offsetWidth;
    window.requestAnimationFrame(() => {
      packet.style.transition = "";
      packet.classList.add("visible");
      points.slice(1).forEach(([left, top], segmentIndex) => {
        const timer = window.setTimeout(() => {
          packet.style.left = `${left}px`;
          packet.style.top = `${top}px`;
          if (segmentIndex === points.length - 2 && step.floodTargets?.length) {
            animateFloodPackets(step, pointOf, mapElement, step.protocol.replace("TCP ", ""));
          }
        }, segmentIndex * 520);
        packetAnimationTimers.push(timer);
      });
    });
  }

  function animateFloodPackets(step, pointOf, mapElement, label) {
    const [switchLeft, switchTop] = pointOf("switch");
    step.floodTargets.forEach((target, targetIndex) => {
      const [endLeft, endTop] = pointOf(target);
      const clone = document.createElement("div");
      clone.className = "scenario-packet clone visible";
      clone.textContent = label;
      clone.style.left = `${switchLeft}px`;
      clone.style.top = `${switchTop}px`;
      mapElement.appendChild(clone);
      clone.offsetWidth;
      const timer = window.setTimeout(() => {
        clone.style.left = `${endLeft}px`;
        clone.style.top = `${endTop}px`;
      }, 80 + targetIndex * 70);
      const fadeTimer = window.setTimeout(() => {
        clone.classList.remove("visible");
      }, 900 + targetIndex * 70);
      const removeTimer = window.setTimeout(() => clone.remove(), 1150 + targetIndex * 70);
      packetAnimationTimers.push(timer, fadeTimer, removeTimer);
    });
  }

  function reset() {
    stopScenarioAutoplay();
    index = -1;
    setText(ids.progress, `步骤 0 / ${frameworkSteps.length}`);
    setText(ids.stage, "等待开始");
    setText(ids.title, "H1 访问 www.abc.com");
    setText(ids.text, "点击开始后，系统将按步骤展示从 t0 到 t1 的完整通信过程。");
    ["source", "target", "protocol", "cast", "srcMac", "dstMac", "srcIp", "dstIp"].forEach((key) => setText(ids[key], "无"));
    setText(ids.switchAction, "等待接收帧。");
    setText(ids.dns, "未完成");
    setText(ids.tcp, "未建立");
    setText(ids.conclusion, "尚未到达 t1");
    setText(ids.encApp, "无");
    setText(ids.encTransport, "无");
    setText(ids.encNetwork, "无");
    setText(ids.encLink, "无");
    scenarioStepSelect.value = "";
    renderTables();
    document.querySelectorAll(".scenario-css-line").forEach((path) => path.classList.remove("active"));
    document.querySelectorAll("[data-device]").forEach((device) => device.classList.remove("active", "broadcast"));
    clearPacketAnimation();
    document.querySelector("#scenarioPacket").classList.remove("visible");
  }

  function next() {
    if (index >= frameworkSteps.length - 1) {
      stopScenarioAutoplay();
      return;
    }
    index = Math.min(index + 1, frameworkSteps.length - 1);
    render();
  }

  function prev() {
    stopScenarioAutoplay();
    index = Math.max(index - 1, 0);
    render();
  }

  function jumpToStep(stepIndex) {
    stopScenarioAutoplay();
    index = Math.max(0, Math.min(stepIndex, frameworkSteps.length - 1));
    render();
  }

  function stopScenarioAutoplay() {
    if (scenarioAutoplayTimer) {
      window.clearInterval(scenarioAutoplayTimer);
      scenarioAutoplayTimer = null;
    }
    scenarioAutoButton.textContent = "自动播放";
    scenarioAutoButton.classList.remove("active");
  }

  function toggleScenarioAutoplay() {
    if (scenarioAutoplayTimer) {
      stopScenarioAutoplay();
      return;
    }
    if (index < 0 || index >= frameworkSteps.length - 1) {
      reset();
      next();
    }
    scenarioAutoButton.textContent = "暂停播放";
    scenarioAutoButton.classList.add("active");
    scenarioAutoplayTimer = window.setInterval(next, autoplayTiming.scenario);
  }

  document.querySelector("#scenarioStart").addEventListener("click", () => {
    reset();
    next();
  });
  document.querySelector("#scenarioNext").addEventListener("click", () => {
    stopScenarioAutoplay();
    next();
  });
  document.querySelector("#scenarioPrev").addEventListener("click", prev);
  document.querySelector("#scenarioReplay").addEventListener("click", () => {
    if (index >= 0) renderScenarioPath(frameworkSteps[index]);
  });
  scenarioAutoButton.addEventListener("click", toggleScenarioAutoplay);
  scenarioStepSelect.innerHTML = `<option value="">选择步骤</option>` + frameworkSteps
    .map((step, stepIndex) => `<option value="${stepIndex}">${step.title.replace("步骤 ", "")}</option>`)
    .join("");
  scenarioStepSelect.addEventListener("change", (event) => {
    if (event.target.value !== "") {
      jumpToStep(Number(event.target.value));
    }
  });
  document.querySelector("#scenarioReset").addEventListener("click", reset);
  reset();
}

function setDnsPacket(from, to, label) {
  const packet = document.querySelector("#dnsPacket");
  const topology = document.querySelector("#dnsTopology");
  const rect = topology.getBoundingClientRect();
  const points = {
    client: [50, 125],
    local: [rect.width / 2 - 30, 125],
    root: [rect.width - 120, 125],
  };
  const [startLeft, startTop] = points[from] || points.client;
  const [endLeft, endTop] = points[to] || points.client;
  packet.textContent = label;
  packet.classList.remove("visible", "pulse");
  packet.style.left = `${startLeft}px`;
  packet.style.top = `${startTop}px`;
  packet.getBoundingClientRect();
  packet.classList.add("visible");
  window.requestAnimationFrame(() => {
    packet.style.left = `${endLeft}px`;
    packet.style.top = `${endTop}px`;
    if (from === to) {
      packet.classList.add("pulse");
    }
  });
}

function nodeCenter(stage, selector) {
  const node = stage.querySelector(selector);
  const stageRect = stage.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  return {
    left: rect.left - stageRect.left + rect.width / 2 - 32,
    top: rect.top - stageRect.top + rect.height / 2 - 18,
  };
}

function moveLayer2Packet(stage, packet, route, label) {
  const points = route.map((nodeName) => {
    if (stage.id === "arpStage") {
      const lineY = 178 - 17;
      const arpPoints = {
        source: { left: 126, top: 97 },
        sourceCache: { left: 86, top: 184 },
        switch1: { left: 317, top: 97 },
        switch2: { left: 317, top: 257 },
        target: { left: stage.clientWidth - 138, top: 257 },
      };
      return arpPoints[nodeName] || nodeCenter(stage, `[data-arp-node="${nodeName}"]`);
    }
    return nodeCenter(stage, `[data-switch-node="${nodeName}"]`);
  });
  if (points.length === 0) return;
  packet.textContent = label;
  packet.classList.remove("visible", "pulse");
  packet.style.transition = "none";
  packet.style.left = `${points[0].left}px`;
  packet.style.top = `${points[0].top}px`;
  packet.getBoundingClientRect();
  packet.classList.add("visible");
  packet.style.transition = "";
  points.slice(1).forEach((point, index) => {
    window.setTimeout(() => {
      packet.style.left = `${point.left}px`;
      packet.style.top = `${point.top}px`;
      if (index === points.length - 2 && points.length === 1) {
        packet.classList.add("pulse");
      }
    }, 80 + index * 450);
  });
  if (points.length === 1) {
    packet.classList.add("pulse");
  }
}

function renderSimpleTable(table, rows, emptyText, columns = 2) {
  if (!rows.length) {
    table.innerHTML = `<tr><td colspan="${columns}">${emptyText}</td></tr>`;
    return;
  }
  table.innerHTML = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
}

function setupDnsDemo() {
  let index = -1;
  let activeSteps = [];
  let dnsAutoplayTimer = null;
  let cache = [
    { domain: "localhost", ip: "127.0.0.1", source: "系统默认" },
    { domain: "school.example", ip: "198.51.100.8", source: "历史缓存" },
  ];
  const title = document.querySelector("#dnsStepTitle");
  const text = document.querySelector("#dnsStepText");
  const table = document.querySelector("#dnsCacheTable");
  const result = document.querySelector("#dnsResult");
  const cacheStatus = document.querySelector("#dnsCacheStatus");
  const queryType = document.querySelector("#dnsQueryType");
  const domainInput = document.querySelector("#dnsDomain");
  const dnsAutoButton = document.querySelector("#dnsAuto");
  const nodes = document.querySelectorAll("#dnsTopology .node");
  const links = document.querySelectorAll("#dnsTopology .link");

  function steps() {
    const domain = domainInput.value.trim() || "www.abc.com";
    const cached = cache.find((item) => item.domain === domain);
    if (cached) {
      return [
        {
          title: "步骤 1：客户端查询 DNS 缓存",
          text: `客户端准备访问 ${domain}，先检查本地 DNS 缓存表。`,
          node: "client",
          link: "client-local",
          from: "client",
          to: "local",
          label: "查缓存",
          status: "查询中",
          type: "本地缓存查询",
        },
        {
          title: "步骤 2：缓存命中",
          text: `缓存表中已经存在 ${domain} -> ${cached.ip}，无需继续访问外部 DNS 服务器。`,
          node: "local",
          link: "client-local",
          from: "local",
          to: "local",
          label: "命中",
          status: "缓存命中",
          type: "本地直接返回",
          result: `解析结果：${domain} = ${cached.ip}`,
        },
        {
          title: "步骤 3：返回解析结果",
          text: `本地 DNS 将缓存中的 IP 地址 ${cached.ip} 返回给客户端，DNS 查询结束。`,
          node: "client",
          link: "client-local",
          from: "local",
          to: "client",
          label: "IP",
          status: "缓存命中",
          type: "单播响应",
          result: `解析结果：${domain} = ${cached.ip}`,
        },
      ];
    }

    return [
      {
        title: "步骤 1：客户端查询 DNS 缓存",
        text: `客户端准备访问 ${domain}，先检查本地 DNS 缓存表，当前没有该域名记录。`,
        node: "client",
        link: "client-local",
        from: "client",
        to: "local",
        label: "查缓存",
        status: "缓存未命中",
        type: "本地缓存查询",
      },
      {
        title: "步骤 2：向本地 DNS 发送查询",
        text: "客户端把 DNS Query 发送给本地域名服务器，请求解析目标域名。",
        node: "local",
        link: "client-local",
        from: "client",
        to: "local",
        label: "Query",
        status: "缓存未命中",
        type: "递归查询发起",
      },
      {
        title: "步骤 3：本地 DNS 继续向外查询",
        text: "本地 DNS 缓存未命中，向根 DNS 和权威 DNS 查询目标域名对应的 IP 地址。",
        node: "root",
        link: "local-root",
        from: "local",
        to: "root",
        label: "递归",
        status: "缓存未命中",
        type: "递归/迭代查询",
      },
      {
        title: "步骤 4：返回解析结果并写入缓存",
        text: `权威 DNS 返回 ${domain} 的 IP 地址 203.0.113.10，本地 DNS 更新缓存表。`,
        node: "local",
        link: "local-root",
        from: "root",
        to: "local",
        label: "Answer",
        status: "缓存更新",
        type: "权威响应",
        cache: { domain, ip: "203.0.113.10", source: "权威 DNS" },
        result: `解析结果：${domain} = 203.0.113.10`,
      },
      {
        title: "步骤 5：客户端获得最终 IP",
        text: `本地 DNS 将 203.0.113.10 返回给客户端，浏览器可以继续发起 TCP 和 HTTP 通信。`,
        node: "client",
        link: "client-local",
        from: "local",
        to: "client",
        label: "IP",
        status: "查询完成",
        type: "单播响应",
        result: `解析结果：${domain} = 203.0.113.10`,
      },
    ];
  }

  function renderCache() {
    table.innerHTML = cache
      .map((row) => `<tr><td>${row.domain}</td><td>${row.ip}</td><td>${row.source}</td></tr>`)
      .join("");
  }

  function render(step) {
    nodes.forEach((node) => node.classList.toggle("active", node.dataset.node === step.node));
    links.forEach((link) => link.classList.toggle("active", link.dataset.link === step.link));
    title.textContent = step.title;
    text.textContent = step.text;
    cacheStatus.textContent = step.status;
    queryType.textContent = step.type;
    if (step.result) {
      result.textContent = step.result;
      result.classList.add("success");
    }
    setDnsPacket(step.from, step.to, step.label);
    if (step.cache && !cache.some((item) => item.domain === step.cache.domain)) {
      cache.push(step.cache);
      renderCache();
    }
  }

  function resetVisual() {
    stopDnsAutoplay();
    index = -1;
    activeSteps = [];
    title.textContent = "等待开始";
    text.textContent = "输入域名后点击开始，系统会展示缓存查询、递归查询和缓存更新过程。";
    result.textContent = "解析结果：等待查询";
    result.classList.remove("success");
    cacheStatus.textContent = "未查询";
    queryType.textContent = "等待开始";
    nodes.forEach((node) => node.classList.remove("active"));
    links.forEach((link) => link.classList.remove("active"));
    document.querySelector("#dnsPacket").classList.remove("visible");
    renderCache();
  }

  function clearCache() {
    stopDnsAutoplay();
    cache = [{ domain: "localhost", ip: "127.0.0.1", source: "系统默认" }];
    resetVisual();
    cacheStatus.textContent = "缓存已清空";
  }

  function next() {
    if (activeSteps.length === 0) {
      activeSteps = steps();
    }
    if (index >= activeSteps.length - 1) {
      stopDnsAutoplay();
      return;
    }
    index = Math.min(index + 1, activeSteps.length - 1);
    render(activeSteps[index]);
  }

  function stopDnsAutoplay() {
    if (dnsAutoplayTimer) {
      window.clearInterval(dnsAutoplayTimer);
      dnsAutoplayTimer = null;
    }
    dnsAutoButton.textContent = "自动播放";
    dnsAutoButton.classList.remove("active");
  }

  function toggleDnsAutoplay() {
    if (dnsAutoplayTimer) {
      stopDnsAutoplay();
      return;
    }
    if (activeSteps.length === 0 || index >= activeSteps.length - 1) {
      resetVisual();
      activeSteps = steps();
      next();
    }
    dnsAutoButton.textContent = "暂停播放";
    dnsAutoButton.classList.add("active");
    dnsAutoplayTimer = window.setInterval(next, autoplayTiming.dns);
  }

  document.querySelector("#dnsStart").addEventListener("click", () => {
    resetVisual();
    activeSteps = steps();
    next();
  });
  document.querySelector("#dnsNext").addEventListener("click", () => {
    stopDnsAutoplay();
    next();
  });
  dnsAutoButton.addEventListener("click", toggleDnsAutoplay);
  document.querySelector("#dnsReset").addEventListener("click", resetVisual);
  document.querySelector("#dnsClearCache").addEventListener("click", clearCache);
  resetVisual();
}

function setupTcpDemo() {
  let index = -1;
  let sequence = [];
  let tcpAutoplayTimer = null;
  const title = document.querySelector("#tcpStepTitle");
  const text = document.querySelector("#tcpStepText");
  const packet = document.querySelector("#tcpPacket");
  const wire = document.querySelector(".tcp-wire");
  const client = document.querySelector(".endpoint.client");
  const server = document.querySelector(".endpoint.server");
  const clientState = document.querySelector("#clientState");
  const serverState = document.querySelector("#serverState");
  const clientStateTable = document.querySelector("#clientStateTable");
  const serverStateTable = document.querySelector("#serverStateTable");
  const result = document.querySelector("#tcpResult");
  const logTable = document.querySelector("#tcpLogTable");
  const connectButton = document.querySelector("#tcpConnect");
  const closeButton = document.querySelector("#tcpClose");
  const tcpAutoButton = document.querySelector("#tcpAuto");

  const connectSteps = [
    ["步骤 1：客户端发送 SYN", "客户端主动打开连接，发送 SYN=1、seq=x，进入 SYN-SENT 状态。", "SYN", "客户端 -> 服务器", "right", "SYN-SENT", "LISTEN"],
    ["步骤 2：服务器返回 SYN + ACK", "服务器确认客户端请求，发送 SYN=1、ACK=1、ack=x+1，进入 SYN-RECEIVED 状态。", "SYN+ACK", "服务器 -> 客户端", "left", "SYN-SENT", "SYN-RECEIVED"],
    ["步骤 3：客户端发送 ACK", "客户端发送 ACK=1、ack=y+1，双方进入 ESTABLISHED，连接建立完成。", "ACK", "客户端 -> 服务器", "right", "ESTABLISHED", "ESTABLISHED", "连接结果：TCP 连接建立成功"],
  ];

  const closeSteps = [
    ["步骤 1：客户端发送 FIN", "客户端主动关闭连接，发送 FIN=1，进入 FIN-WAIT-1 状态。", "FIN", "客户端 -> 服务器", "right", "FIN-WAIT-1", "ESTABLISHED"],
    ["步骤 2：服务器返回 ACK", "服务器确认客户端 FIN，客户端进入 FIN-WAIT-2，服务器进入 CLOSE-WAIT。", "ACK", "服务器 -> 客户端", "left", "FIN-WAIT-2", "CLOSE-WAIT"],
    ["步骤 3：服务器发送 FIN", "服务器剩余数据发送完毕后发送 FIN=1，进入 LAST-ACK 状态。", "FIN", "服务器 -> 客户端", "left", "FIN-WAIT-2", "LAST-ACK"],
    ["步骤 4：客户端返回 ACK", "客户端确认服务器 FIN，进入 TIME-WAIT；服务器收到 ACK 后进入 CLOSED。", "ACK", "客户端 -> 服务器", "right", "TIME-WAIT", "CLOSED"],
    ["步骤 5：连接完全释放", "TIME-WAIT 等待结束后客户端进入 CLOSED，四次挥手完成。", "完成", "客户端/服务器", "right", "CLOSED", "CLOSED", "连接结果：TCP 连接释放完成"],
  ];

  function render(step) {
    const [stepTitle, stepText, label, flowText, direction, cState, sState, finalResult] = step;
    title.textContent = stepTitle;
    text.textContent = stepText;
    packet.textContent = label;
    packet.classList.remove("visible", "pulse");
    packet.style.transition = "none";
    wire.classList.add("active");
    packet.style.left = direction === "right" ? "0" : "calc(100% - 58px)";
    packet.getBoundingClientRect();
    packet.classList.add("visible");
    window.setTimeout(() => {
      packet.style.transition = "";
      packet.style.left = direction === "right" ? "calc(100% - 58px)" : "0";
      if (label === "完成") {
        packet.classList.add("pulse");
      }
    }, 80);
    client.classList.toggle("active", direction === "right");
    server.classList.toggle("active", direction === "left");
    clientState.textContent = cState;
    serverState.textContent = sState;
    clientStateTable.textContent = cState;
    serverStateTable.textContent = sState;
    if (finalResult) {
      result.textContent = finalResult;
      result.classList.add("success");
    } else {
      result.textContent = "连接结果：执行中";
      result.classList.remove("success");
    }
    logTable.innerHTML = sequence
      .slice(0, index + 1)
      .map((item, itemIndex) => `<tr><td>${itemIndex + 1}</td><td>${item[2]}</td><td>${item[3]}</td></tr>`)
      .join("");
  }

  function start(list, mode) {
    stopTcpAutoplay();
    sequence = list;
    index = -1;
    logTable.innerHTML = "";
    result.textContent = mode === "connect" ? "连接结果：已选择建立连接" : "连接结果：已选择释放连接";
    result.classList.remove("success");
    connectButton.classList.toggle("active", mode === "connect");
    closeButton.classList.toggle("active", mode === "close");
    title.textContent = mode === "connect" ? "准备建立 TCP 连接" : "准备释放 TCP 连接";
    text.textContent = "点击下一步逐步演示，或点击自动播放连续演示。";
    packet.classList.remove("visible");
    wire.classList.remove("active");
    client.classList.remove("active");
    server.classList.remove("active");
  }

  function next() {
    if (sequence.length === 0) {
      sequence = connectSteps;
    }
    if (index >= sequence.length - 1) {
      stopTcpAutoplay();
      return;
    }
    index = Math.min(index + 1, sequence.length - 1);
    render(sequence[index]);
  }

  function reset() {
    stopTcpAutoplay();
    index = -1;
    sequence = [];
    connectButton.classList.remove("active");
    closeButton.classList.remove("active");
    title.textContent = "等待开始";
    text.textContent = "点击建立连接或释放连接，然后逐步查看 SYN、ACK、FIN 报文与状态变化。";
    result.textContent = "连接结果：等待操作";
    result.classList.remove("success");
    logTable.innerHTML = "";
    packet.classList.remove("visible");
    wire.classList.remove("active");
    client.classList.remove("active");
    server.classList.remove("active");
    clientState.textContent = "CLOSED";
    serverState.textContent = "CLOSED";
    clientStateTable.textContent = "CLOSED";
    serverStateTable.textContent = "CLOSED";
  }

  function stopTcpAutoplay() {
    if (tcpAutoplayTimer) {
      window.clearInterval(tcpAutoplayTimer);
      tcpAutoplayTimer = null;
    }
    tcpAutoButton.textContent = "自动播放";
    tcpAutoButton.classList.remove("active");
  }

  function toggleTcpAutoplay() {
    if (tcpAutoplayTimer) {
      stopTcpAutoplay();
      return;
    }
    if (sequence.length === 0 || index >= sequence.length - 1) {
      if (sequence.length === 0) {
        start(connectSteps, "connect");
      } else {
        index = -1;
        logTable.innerHTML = "";
        result.textContent = "连接结果：执行中";
        result.classList.remove("success");
      }
      next();
    }
    tcpAutoButton.textContent = "暂停播放";
    tcpAutoButton.classList.add("active");
    tcpAutoplayTimer = window.setInterval(next, autoplayTiming.tcp);
  }

  connectButton.addEventListener("click", () => start(connectSteps, "connect"));
  closeButton.addEventListener("click", () => start(closeSteps, "close"));
  document.querySelector("#tcpNext").addEventListener("click", () => {
    stopTcpAutoplay();
    next();
  });
  tcpAutoButton.addEventListener("click", toggleTcpAutoplay);
  document.querySelector("#tcpReset").addEventListener("click", reset);
  reset();
}

function setupArpDemo() {
  let index = -1;
  let timer = null;
  let cacheRows = [];
  const stage = document.querySelector("#arpStage");
  const packet = document.querySelector("#arpPacket");
  const title = document.querySelector("#arpStepTitle");
  const text = document.querySelector("#arpStepText");
  const result = document.querySelector("#arpResult");
  const frameType = document.querySelector("#arpFrameType");
  const cast = document.querySelector("#arpCast");
  const srcMac = document.querySelector("#arpSrcMac");
  const dstMac = document.querySelector("#arpDstMac");
  const table = document.querySelector("#arpCacheTable");
  const autoButton = document.querySelector("#arpAuto");
  const nodes = stage.querySelectorAll("[data-arp-node]");
  const paths = stage.querySelectorAll("[data-arp-path]");
  const mac = {
    h1: "00-11-22-33-44-cc",
    h2: "00-11-22-33-44-dd",
    broadcast: "ff-ff-ff-ff-ff-ff",
  };
  const steps = [
    {
      title: "步骤 1：源主机检查 ARP 缓存",
      text: "H1 已知目标 IP 为 192.168.1.3，但 ARP 表中没有该 IP 对应的 MAC 地址，因此需要发起 ARP 地址解析。",
      label: "查表",
      route: ["sourceCache"],
      active: ["source"],
      frame: "本地 ARP 表查询",
      cast: "本机检查",
      src: mac.h1,
      dst: "未知",
      paths: [],
      result: "解析结果：目标 MAC 未知",
      cache: [],
    },
    {
      title: "步骤 2：H1 发送 ARP Request 广播",
      text: "H1 构造 ARP Request：谁拥有 192.168.1.3？请告诉 192.168.1.2。以太网目的 MAC 使用广播地址。",
      label: "Request",
      route: ["source", "switch1"],
      active: ["source", "switch1"],
      broadcast: ["switch1"],
      frame: "ARP Request",
      cast: "广播",
      src: mac.h1,
      dst: mac.broadcast,
      paths: ["source-switch1"],
      result: "解析结果：广播查询中",
      cache: [],
    },
    {
      title: "步骤 3：两个交换机继续泛洪 ARP Request",
      text: "交换机不会解析 ARP 内容，只根据目的 MAC 为广播地址进行泛洪。S1 将请求转发给 S2，S2 再把广播帧送到 H2。",
      label: "广播",
      route: ["switch1", "switch2", "target"],
      active: ["switch1", "switch2", "target"],
      broadcast: ["switch1", "switch2", "target"],
      frame: "ARP Request",
      cast: "广播泛洪",
      src: mac.h1,
      dst: mac.broadcast,
      paths: ["switch1-switch2", "switch2-target"],
      result: "解析结果：H2 收到查询",
      cache: [],
    },
    {
      title: "步骤 4：H2 返回 ARP Reply",
      text: "H2 发现请求中的目标 IP 正是自己，于是单播 ARP Reply，把自己的 MAC 地址返回给 H1。",
      label: "Reply",
      route: ["target", "switch2", "switch1", "source"],
      active: ["target", "switch2", "switch1", "source"],
      frame: "ARP Reply",
      cast: "单播",
      src: mac.h2,
      dst: mac.h1,
      paths: ["switch2-target", "switch1-switch2", "source-switch1"],
      result: "解析结果：H1 收到 H2 的 MAC",
      cache: [],
    },
    {
      title: "步骤 5：H1 写入 ARP 缓存表",
      text: "H1 将 192.168.1.3 与 00-11-22-33-44-dd 的映射写入 ARP 缓存，后续发往 H2 的帧即可直接使用该 MAC。",
      label: "写入",
      route: ["source"],
      active: ["source", "target"],
      frame: "缓存更新",
      cast: "本机写表",
      src: mac.h2,
      dst: mac.h1,
      paths: [],
      result: "解析结果：192.168.1.3 -> 00-11-22-33-44-dd",
      cache: [["192.168.1.3", mac.h2]],
      success: true,
    },
  ];

  function stopAuto() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    autoButton.textContent = "自动播放";
    autoButton.classList.remove("active");
  }

  function render(step) {
    nodes.forEach((node) => {
      node.classList.toggle("active", step.active.includes(node.dataset.arpNode));
      node.classList.toggle("broadcast", step.broadcast?.includes(node.dataset.arpNode));
    });
    paths.forEach((path) => path.classList.toggle("active", step.paths.includes(path.dataset.arpPath)));
    title.textContent = step.title;
    text.textContent = step.text;
    frameType.textContent = step.frame;
    cast.textContent = step.cast;
    srcMac.textContent = step.src;
    dstMac.textContent = step.dst;
    result.textContent = step.result;
    result.classList.toggle("success", Boolean(step.success));
    cacheRows = step.cache;
    renderSimpleTable(table, cacheRows, "空");
    moveLayer2Packet(stage, packet, step.route, step.label);
  }

  function next() {
    if (index >= steps.length - 1) {
      stopAuto();
      return;
    }
    index += 1;
    render(steps[index]);
  }

  function reset() {
    stopAuto();
    index = -1;
    cacheRows = [];
    title.textContent = "等待开始";
    text.textContent = "源主机已知目标 IP，但不知道目标 MAC，点击开始后逐步观察 ARP 广播与应答。";
    result.textContent = "解析结果：等待操作";
    result.classList.remove("success");
    frameType.textContent = "无";
    cast.textContent = "无";
    srcMac.textContent = "无";
    dstMac.textContent = "无";
    nodes.forEach((node) => node.classList.remove("active", "broadcast"));
    paths.forEach((path) => path.classList.remove("active"));
    packet.classList.remove("visible", "pulse");
    renderSimpleTable(table, cacheRows, "空");
  }

  function toggleAuto() {
    if (timer) {
      stopAuto();
      return;
    }
    if (index >= steps.length - 1) reset();
    next();
    autoButton.textContent = "暂停播放";
    autoButton.classList.add("active");
    timer = window.setInterval(next, autoplayTiming.arp);
  }

  document.querySelector("#arpStart").addEventListener("click", () => {
    reset();
    next();
  });
  document.querySelector("#arpNext").addEventListener("click", () => {
    stopAuto();
    next();
  });
  autoButton.addEventListener("click", toggleAuto);
  document.querySelector("#arpReset").addEventListener("click", reset);
  reset();
}

function setupSwitchingDemo() {
  let index = -1;
  let timer = null;
  const stage = document.querySelector("#switchingStage");
  const packet = document.querySelector("#switchingPacket");
  const title = document.querySelector("#switchingStepTitle");
  const text = document.querySelector("#switchingStepText");
  const result = document.querySelector("#switchingResult");
  const frame = document.querySelector("#switchingFrame");
  const mode = document.querySelector("#switchingMode");
  const action = document.querySelector("#switchingAction");
  const outcome = document.querySelector("#switchingOutcome");
  const table = document.querySelector("#switchingMacTable");
  const autoButton = document.querySelector("#switchingAuto");
  const nodes = stage.querySelectorAll("[data-switch-node]");
  const paths = stage.querySelectorAll("[data-switch-path]");
  const mac = {
    h1: "00-11-22-33-44-11",
    h2: "00-11-22-33-44-22",
    h3: "00-11-22-33-44-33",
    h4: "00-11-22-33-44-44",
  };
  const steps = [
    {
      title: "步骤 1：交换机 MAC 地址表为空",
      text: "初始状态下，交换机 S 尚未学习到任何主机 MAC 地址与端口的对应关系。",
      label: "空表",
      route: ["switch"],
      active: ["switch"],
      paths: [],
      frame: "无",
      mode: "等待接收",
      action: "MAC 地址表为空，等待主机发送以太网帧。",
      outcome: "尚未转发",
      table: [],
    },
    {
      title: "步骤 2：H1 向 H2 发送数据帧",
      text: "H1 发送目的 MAC 为 H2 的以太网帧。交换机从端口 1 收到该帧，首先学习源 MAC H1 位于端口 1。",
      label: "H1->H2",
      route: ["h1", "switch"],
      active: ["h1", "switch"],
      paths: ["h1-switch"],
      frame: `${mac.h1} -> ${mac.h2}`,
      mode: "入站学习",
      action: "学习源 MAC：H1 位于端口 1；查询目的 MAC H2，表中未知。",
      outcome: "准备泛洪",
      table: [[mac.h1, "1"]],
    },
    {
      title: "步骤 3：目的 MAC 未知，交换机泛洪",
      text: "由于表中没有 H2 的 MAC，交换机向除入端口之外的端口 2、3、4 泛洪该帧，H2、H3、H4 都会收到。",
      label: "泛洪",
      route: ["switch", "h2"],
      active: ["switch", "h2", "h3", "h4"],
      broadcast: ["h2", "h3", "h4"],
      paths: ["h2-switch", "h3-switch", "h4-switch"],
      frame: `${mac.h1} -> ${mac.h2}`,
      mode: "泛洪",
      action: "目的 MAC 未知，向端口 2、3、4 泛洪；非目标主机收到后丢弃。",
      outcome: "H2 接收，H3/H4 丢弃",
      table: [[mac.h1, "1"]],
    },
    {
      title: "步骤 4：H2 返回数据帧，交换机学习 H2",
      text: "H2 向 H1 返回数据帧。交换机从端口 2 收到后学习 H2 的 MAC 位于端口 2。",
      label: "H2->H1",
      route: ["h2", "switch", "h1"],
      active: ["h2", "switch", "h1"],
      paths: ["h2-switch", "h1-switch"],
      frame: `${mac.h2} -> ${mac.h1}`,
      mode: "学习后定向",
      action: "学习源 MAC：H2 位于端口 2；目的 MAC H1 已知在端口 1，定向转发。",
      outcome: "H1 收到应答",
      table: [[mac.h1, "1"], [mac.h2, "2"]],
    },
    {
      title: "步骤 5：H1 再次向 H2 发送，交换机定向转发",
      text: "此时交换机已经知道 H2 位于端口 2，H1 再发送给 H2 时无需泛洪，只转发到端口 2。",
      label: "单播",
      route: ["h1", "switch", "h2"],
      active: ["h1", "switch", "h2"],
      paths: ["h1-switch", "h2-switch"],
      frame: `${mac.h1} -> ${mac.h2}`,
      mode: "定向转发",
      action: "确认/刷新 H1 位于端口 1；查表命中 H2 位于端口 2，只向端口 2 转发。",
      outcome: "H2 收到，其他主机不受影响",
      table: [[mac.h1, "1"], [mac.h2, "2"]],
      success: true,
    },
  ];

  function stopAuto() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    autoButton.textContent = "自动播放";
    autoButton.classList.remove("active");
  }

  function render(step) {
    nodes.forEach((node) => {
      node.classList.toggle("active", step.active.includes(node.dataset.switchNode));
      node.classList.toggle("broadcast", step.broadcast?.includes(node.dataset.switchNode));
    });
    paths.forEach((path) => path.classList.toggle("active", step.paths.includes(path.dataset.switchPath)));
    title.textContent = step.title;
    text.textContent = step.text;
    frame.textContent = step.frame;
    mode.textContent = step.mode;
    action.textContent = step.action;
    outcome.textContent = step.outcome;
    result.textContent = step.success ? "转发结果：目的 MAC 已知，定向转发完成" : `转发结果：${step.outcome}`;
    result.classList.toggle("success", Boolean(step.success));
    renderSimpleTable(table, step.table, "空");
    moveLayer2Packet(stage, packet, step.route, step.label);
  }

  function next() {
    if (index >= steps.length - 1) {
      stopAuto();
      return;
    }
    index += 1;
    render(steps[index]);
  }

  function reset() {
    stopAuto();
    index = -1;
    title.textContent = "等待开始";
    text.textContent = "交换机初始 MAC 地址表为空，逐步观察源 MAC 学习、未知泛洪和已知单播转发。";
    result.textContent = "转发结果：等待操作";
    result.classList.remove("success");
    frame.textContent = "无";
    mode.textContent = "无";
    action.textContent = "等待接收帧";
    outcome.textContent = "无";
    nodes.forEach((node) => node.classList.remove("active", "broadcast"));
    paths.forEach((path) => path.classList.remove("active"));
    packet.classList.remove("visible", "pulse");
    renderSimpleTable(table, [], "空");
  }

  function toggleAuto() {
    if (timer) {
      stopAuto();
      return;
    }
    if (index >= steps.length - 1) reset();
    next();
    autoButton.textContent = "暂停播放";
    autoButton.classList.add("active");
    timer = window.setInterval(next, autoplayTiming.switching);
  }

  document.querySelector("#switchingStart").addEventListener("click", () => {
    reset();
    next();
  });
  document.querySelector("#switchingNext").addEventListener("click", () => {
    stopAuto();
    next();
  });
  autoButton.addEventListener("click", toggleAuto);
  document.querySelector("#switchingReset").addEventListener("click", reset);
  reset();
}

async function setupKnowledgeGraphStable() {
  const svg = document.querySelector("#knowledgeGraph");
  const detailType = document.querySelector("#graphNodeType");
  const detailTitle = document.querySelector("#graphNodeTitle");
  const detailSummary = document.querySelector("#graphNodeSummary");
  const detailLayer = document.querySelector("#graphNodeLayer");
  const detailCategory = document.querySelector("#graphNodeCategory");
  const detailUnit = document.querySelector("#graphNodeUnit");
  const detailRelation = document.querySelector("#graphNodeRelation");
  const graphToKnowledgeButton = document.querySelector("#graphToKnowledge");
  const depthSelect = document.querySelector("#graphDepth");
  const all = await fetchJson("/api/knowledge?page_size=50");
  const layerNodes = layerOrder.map((layer) => ({
    id: `layer-${layer}`,
    title: layer,
    nodeType: "layer",
    layer,
    category: "网络层级",
    unit: layerProfiles[layer].units,
    summary: layerProfiles[layer].intro,
    detail: layerProfiles[layer].function,
    relation: layerProfiles[layer].relation,
    children: all.items
      .filter((item) => item.layer === layer)
      .slice(0, 7)
      .map((item) => ({
        id: `item-${item.id}`,
        title: item.title,
        nodeType: "item",
        layer: item.layer,
        category: item.category,
        unit: item.device_or_unit || "无",
        summary: item.summary,
        detail: item.detail,
        relation: `${item.title} 属于 ${item.layer}，是该层知识体系中的 ${item.category}。`,
      })),
  }));
  const root = {
    id: "root",
    title: "计算机网络",
    nodeType: "root",
    layer: "整体",
    category: "知识体系",
    unit: "TCP/IP 五层模型",
    summary: "计算机网络由应用层、传输层、网络层、数据链路层、物理层协作完成通信。",
    detail: "顶层节点用于组织整体知识结构，向下展开五层模型和各层关键协议、设备、技术与概念。",
    relation: "中心节点连接五层模型，五层模型继续连接具体知识点。",
    children: layerNodes,
  };
  let focusNode = root;
  let selectedId = "root";
  let viewBox = { x: 0, y: 0, w: 1400, h: 920 };
  let panState = null;
  let dragState = null;
  const nodePositions = new Map();

  function getVisibleTree() {
    const depth = depthSelect.value;
    if (focusNode.nodeType === "root") {
      return root;
    }
    if (focusNode.nodeType === "layer") {
      return { ...focusNode, children: depth === "1" ? [] : focusNode.children };
    }
    return focusNode;
  }

  function buildLayout() {
    const nodes = [];
    const links = [];
    const showItems = depthSelect.value !== "1";
    const focusLayer = focusNode.nodeType === "layer" ? focusNode : null;
    const visibleLayers = focusLayer ? [focusLayer] : layerNodes;
    const rootY = focusLayer ? 450 : 460;
    nodes.push(positioned(root, 120, rootY, 44, 0));
    visibleLayers.forEach((layer, layerIndex) => {
      const layerY = focusLayer ? 450 : 140 + layerIndex * 190;
      nodes.push(positioned(layer, 390, layerY, 34, 1));
      links.push({ source: "root", target: layer.id });
      if (showItems || depthSelect.value === "all") {
        layer.children.forEach((item, itemIndex) => {
          const col = itemIndex % 3;
          const row = Math.floor(itemIndex / 3);
          const x = focusLayer ? 690 + col * 230 : 670 + col * 230;
          const y = focusLayer ? 340 + row * 95 : layerY - 64 + row * 56;
          nodes.push(positioned(item, x, y, 22, 2));
          links.push({ source: layer.id, target: item.id });
        });
      }
    });
    return { nodes, links };
  }

  function positioned(node, x, y, r, depth) {
    const manual = nodePositions.get(node.id);
    return { ...node, x: manual?.x ?? x, y: manual?.y ?? y, r, depth };
  }

  function draw() {
    const { nodes, links } = buildLayout();
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    svg.innerHTML = "";
    const defs = createSvg("defs", {});
    defs.innerHTML = `
      <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    `;
    svg.appendChild(defs);
    links.forEach((link) => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      const path = createSvg("path", {
        d: curvedPath(source, target),
        class: `graph-link ${source.id === selectedId || target.id === selectedId ? "emphasis" : ""}`,
      });
      svg.appendChild(path);
    });
    nodes.forEach((node, index) => {
      const group = createSvg("g", {
        class: `graph-node stable-node ${node.id === selectedId ? "selected" : ""} ${node.nodeType}-graph-node`,
        transform: `translate(${node.x} ${node.y})`,
        style: `--delay:${index * 22}ms`,
      });
      const circle = createSvg("circle", {
        r: node.r,
        fill: nodeColor(node),
      });
      const text = createSvg("text", {
        "text-anchor": "middle",
        y: node.r + 17,
        class: "graph-label",
      });
      text.textContent = node.title;
      group.appendChild(circle);
      group.appendChild(text);
      group.addEventListener("click", () => {
        if (group.dataset.dragged === "true") {
          group.dataset.dragged = "false";
          return;
        }
        selectedId = node.id;
        if (node.nodeType === "root" || node.nodeType === "layer") {
          focusNode = node.nodeType === "root" ? root : layerNodes.find((layer) => layer.id === node.id);
        }
        showDetail(node);
        draw();
      });
      group.addEventListener("pointerdown", (event) => startNodeDrag(event, node, group));
      svg.appendChild(group);
    });
    applyViewBox();
  }

  function curvedPath(source, target) {
    const mid = (source.x + target.x) / 2;
    return `M ${source.x} ${source.y} C ${mid} ${source.y}, ${mid} ${target.y}, ${target.x} ${target.y}`;
  }

  function nodeColor(node) {
    if (node.nodeType === "root") return "#111827";
    if (node.nodeType === "layer") return "#2563eb";
    const colors = {
      协议: "#2563eb",
      设备: "#147d64",
      技术: "#7c3aed",
      机制: "#a15c07",
      概念: "#be123c",
      数据结构: "#0f766e",
      数据单位: "#4f46e5",
      介质: "#6b7280",
    };
    return colors[node.category] || "#475569";
  }

  function showDetail(node) {
    detailType.textContent = node.nodeType === "root" ? "知识体系" : node.category;
    detailTitle.textContent = node.title;
    detailSummary.textContent = node.detail || node.summary;
    detailLayer.textContent = node.layer;
    detailCategory.textContent = node.category;
    detailUnit.textContent = node.unit;
    detailRelation.textContent = node.relation;
  }

  function createSvg(name, attrs) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function applyViewBox() {
    svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  }

  function zoomGraph(scale) {
    const cx = viewBox.x + viewBox.w / 2;
    const cy = viewBox.y + viewBox.h / 2;
    viewBox.w = Math.max(520, Math.min(2200, viewBox.w * scale));
    viewBox.h = Math.max(340, Math.min(1500, viewBox.h * scale));
    viewBox.x = cx - viewBox.w / 2;
    viewBox.y = cy - viewBox.h / 2;
    applyViewBox();
  }

  function svgPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function startNodeDrag(event, node, group) {
    event.stopPropagation();
    const point = svgPoint(event);
    dragState = {
      node,
      group,
      offsetX: point.x - node.x,
      offsetY: point.y - node.y,
      moved: false,
    };
    group.classList.add("dragging");
    svg.setPointerCapture(event.pointerId);
  }

  function startPan(event) {
    if (event.target.closest(".graph-node")) return;
    const point = svgPoint(event);
    panState = { x: point.x, y: point.y, viewX: viewBox.x, viewY: viewBox.y };
    svg.classList.add("panning");
    svg.setPointerCapture(event.pointerId);
  }

  function movePointer(event) {
    if (dragState) {
      const point = svgPoint(event);
      const x = point.x - dragState.offsetX;
      const y = point.y - dragState.offsetY;
      nodePositions.set(dragState.node.id, { x, y });
      dragState.group.setAttribute("transform", `translate(${x} ${y})`);
      dragState.group.dataset.dragged = "true";
      dragState.moved = true;
      redrawLinksOnly();
      return;
    }
    if (panState) {
      const point = svgPoint(event);
      viewBox.x = panState.viewX - (point.x - panState.x);
      viewBox.y = panState.viewY - (point.y - panState.y);
      applyViewBox();
    }
  }

  function stopPointer(event) {
    if (dragState) {
      dragState.group.classList.remove("dragging");
      dragState = null;
    }
    if (panState) {
      panState = null;
      svg.classList.remove("panning");
    }
    if (svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
  }

  function redrawLinksOnly() {
    const { nodes, links } = buildLayout();
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    svg.querySelectorAll(".graph-link").forEach((path, index) => {
      const link = links[index];
      if (!link) return;
      path.setAttribute("d", curvedPath(nodeMap.get(link.source), nodeMap.get(link.target)));
    });
  }

  document.querySelector("#fitGraph").onclick = () => {
    focusNode = root;
    selectedId = "root";
    depthSelect.value = "3";
    nodePositions.clear();
    viewBox = { x: 0, y: 0, w: 1400, h: 920 };
    showDetail(root);
    draw();
  };
  document.querySelector("#showAllGraph").onclick = () => {
    focusNode = root;
    selectedId = "root";
    depthSelect.value = "all";
    viewBox = { x: 0, y: 0, w: 1400, h: 920 };
    showDetail(root);
    draw();
  };
  document.querySelector("#pulseGraph").onclick = () => {
    svg.classList.remove("pulse-relations");
    svg.getBoundingClientRect();
    svg.classList.add("pulse-relations");
  };
  depthSelect.onchange = () => {
    nodePositions.clear();
    draw();
  };
  document.querySelector("#zoomInGraph").onclick = () => zoomGraph(0.78);
  document.querySelector("#zoomOutGraph").onclick = () => zoomGraph(1.24);
  svg.addEventListener("pointerdown", startPan);
  svg.addEventListener("pointermove", movePointer);
  svg.addEventListener("pointerup", stopPointer);
  svg.addEventListener("pointerleave", stopPointer);
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomGraph(event.deltaY < 0 ? 0.88 : 1.14);
  });
  showDetail(root);
  draw();
}

async function setupVisKnowledgeGraph() {
  const container = document.querySelector("#knowledgeGraphNetwork");
  const detailType = document.querySelector("#graphNodeType");
  const detailTitle = document.querySelector("#graphNodeTitle");
  const detailSummary = document.querySelector("#graphNodeSummary");
  const detailLayer = document.querySelector("#graphNodeLayer");
  const detailCategory = document.querySelector("#graphNodeCategory");
  const detailUnit = document.querySelector("#graphNodeUnit");
  const detailRelation = document.querySelector("#graphNodeRelation");
  const depthSelect = document.querySelector("#graphDepth");

  if (!window.vis) {
    container.innerHTML = "<p class='muted graph-load-error'>图谱库加载失败，请检查网络后刷新页面。</p>";
    return;
  }

  const categoryColors = {
    协议: "#2563eb",
    设备: "#147d64",
    技术: "#7c3aed",
    机制: "#a15c07",
    概念: "#be123c",
    数据结构: "#0f766e",
    数据单位: "#4f46e5",
    介质: "#6b7280",
  };
  const all = await fetchJson("/api/knowledge?page_size=50");
  const allNodes = [];
  const allEdges = [];
  const nodeDetails = new Map();

  function addNode(node) {
    allNodes.push(node);
    nodeDetails.set(node.id, node.detailData);
  }

  addNode({
    id: "root",
    label: "计算机网络",
    level: 0,
    shape: "dot",
    size: 42,
    color: { background: "#111827", border: "#facc15" },
    font: { color: "#111827", size: 18, face: "Microsoft YaHei" },
    detailData: {
      type: "知识体系",
      title: "计算机网络",
      summary: "计算机网络由应用层、传输层、网络层、数据链路层、物理层协作完成通信。",
      layer: "整体",
      category: "根节点",
      unit: "TCP/IP 五层模型",
      relation: "中心节点连接五层模型，五层模型继续连接具体协议、设备、技术、机制和概念。",
    },
  });

  layerOrder.forEach((layer) => {
    const profile = layerProfiles[layer];
    const layerId = `layer-${layer}`;
    addNode({
      id: layerId,
      label: layer,
      level: 1,
      shape: "box",
      margin: 14,
      color: { background: "#dbeafe", border: "#2563eb", highlight: { background: "#bfdbfe", border: "#1d4ed8" } },
      font: { color: "#1f2937", size: 16, face: "Microsoft YaHei", bold: true },
      detailData: {
        type: profile.order,
        title: layer,
        summary: profile.function,
        layer,
        category: "网络层级",
        unit: profile.units,
        relation: profile.relation,
      },
    });
    allEdges.push({ id: `edge-root-${layer}`, from: "root", to: layerId, label: "包含", arrows: "to" });
  });

  all.items.forEach((item) => {
    const nodeId = `item-${item.id}`;
    const color = categoryColors[item.category] || "#475569";
    addNode({
      id: nodeId,
      label: item.title,
      level: 2,
      shape: "ellipse",
      color: { background: `${color}22`, border: color, highlight: { background: `${color}33`, border: color } },
      font: { color: "#1f2937", size: 14, face: "Microsoft YaHei" },
      detailData: {
        type: item.category,
        title: item.title,
        summary: item.detail || item.summary,
        layer: item.layer,
        category: item.category,
        unit: item.device_or_unit || "无",
        relation: `${item.title} 属于 ${item.layer}，与该层的核心功能和数据封装过程相关。`,
      },
    });
    allEdges.push({
      id: `edge-${item.layer}-${item.id}`,
      from: `layer-${item.layer}`,
      to: nodeId,
      label: item.category,
      arrows: "to",
      color: { color: "#94a3b8", highlight: color },
    });
  });

  const nodes = new vis.DataSet();
  const edges = new vis.DataSet();
  const network = new vis.Network(container, { nodes, edges }, {
    autoResize: true,
    interaction: {
      dragNodes: true,
      dragView: true,
      hover: true,
      multiselect: false,
      navigationButtons: true,
      selectable: true,
      tooltipDelay: 120,
      zoomView: true,
    },
    physics: {
      enabled: true,
      solver: "forceAtlas2Based",
      forceAtlas2Based: {
        gravitationalConstant: -80,
        centralGravity: 0.012,
        springLength: 130,
        springConstant: 0.08,
        damping: 0.55,
        avoidOverlap: 1,
      },
      stabilization: { iterations: 180, fit: true },
    },
    layout: {
      hierarchical: {
        enabled: true,
        direction: "LR",
        sortMethod: "directed",
        levelSeparation: 260,
        nodeSpacing: 145,
        treeSpacing: 190,
      },
    },
    edges: {
      smooth: { enabled: true, type: "cubicBezier", forceDirection: "horizontal", roundness: 0.45 },
      font: { size: 11, align: "middle", color: "#64748b", face: "Microsoft YaHei" },
      color: { color: "#cbd5e1", highlight: "#2563eb" },
      width: 1.4,
    },
    nodes: {
      borderWidth: 2,
      shadow: { enabled: true, color: "rgba(15, 23, 42, 0.12)", size: 8, x: 0, y: 3 },
    },
  });

  function applyDepth() {
    const depth = depthSelect.value;
    const selectedLayer = network.getSelectedNodes().map((id) => nodeDetails.get(id)).find((item) => item?.category === "网络层级")?.title;
    let visibleNodeIds;
    if (depth === "1") {
      visibleNodeIds = new Set(["root", ...layerOrder.map((layer) => `layer-${layer}`)]);
    } else if (selectedLayer && depth !== "all") {
      visibleNodeIds = new Set(["root", `layer-${selectedLayer}`]);
      all.items.filter((item) => item.layer === selectedLayer).forEach((item) => visibleNodeIds.add(`item-${item.id}`));
    } else {
      visibleNodeIds = new Set(allNodes.map((node) => node.id));
    }
    nodes.clear();
    edges.clear();
    nodes.add(allNodes.filter((node) => visibleNodeIds.has(node.id)));
    edges.add(allEdges.filter((edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)));
    network.once("stabilizationIterationsDone", () => network.fit({ animation: { duration: 450, easingFunction: "easeInOutQuad" } }));
    network.stabilize(80);
  }

  function showDetail(data) {
    detailType.textContent = data.type;
    detailTitle.textContent = data.title;
    detailSummary.textContent = data.summary;
    detailLayer.textContent = data.layer;
    detailCategory.textContent = data.category;
    detailUnit.textContent = data.unit;
    detailRelation.textContent = data.relation;
  }

  network.on("click", (params) => {
    if (!params.nodes.length) return;
    const id = params.nodes[0];
    const data = nodeDetails.get(id);
    showDetail(data);
    const connected = new Set(network.getConnectedNodes(id));
    nodes.update(nodes.get().map((node) => ({
      id: node.id,
      opacity: node.id === id || connected.has(node.id) ? 1 : 0.25,
    })));
    network.focus(id, { scale: 1.18, animation: { duration: 550, easingFunction: "easeInOutQuad" } });
    if (data.category === "网络层级" && depthSelect.value !== "1") {
      setTimeout(applyDepth, 80);
    }
  });

  network.on("doubleClick", (params) => {
    if (params.nodes.length) {
      network.focus(params.nodes[0], { scale: 1.45, animation: true });
    }
  });

  document.querySelector("#fitGraph").onclick = () => {
    depthSelect.value = "3";
    applyDepth();
    network.fit({ animation: { duration: 500, easingFunction: "easeInOutQuad" } });
  };
  document.querySelector("#showAllGraph").onclick = () => {
    depthSelect.value = "all";
    applyDepth();
  };
  document.querySelector("#pulseGraph").onclick = () => {
    edges.update(edges.get().map((edge) => ({ id: edge.id, width: 3 })));
    setTimeout(() => edges.update(edges.get().map((edge) => ({ id: edge.id, width: 1.4 }))), 650);
  };
  document.querySelector("#zoomInGraph").onclick = () => network.moveTo({ scale: network.getScale() * 1.22, animation: true });
  document.querySelector("#zoomOutGraph").onclick = () => network.moveTo({ scale: network.getScale() / 1.22, animation: true });
  depthSelect.onchange = applyDepth;

  showDetail(nodeDetails.get("root"));
  applyDepth();
}

async function setup3DKnowledgeGraph() {
  const container = document.querySelector("#knowledgeGraph3d");
  const detailType = document.querySelector("#graphNodeType");
  const detailTitle = document.querySelector("#graphNodeTitle");
  const detailSummary = document.querySelector("#graphNodeSummary");
  const detailLayer = document.querySelector("#graphNodeLayer");
  const detailCategory = document.querySelector("#graphNodeCategory");
  const detailUnit = document.querySelector("#graphNodeUnit");
  const detailRelation = document.querySelector("#graphNodeRelation");
  const graphToKnowledgeButton = document.querySelector("#graphToKnowledge");
  const depthSelect = document.querySelector("#graphDepth");

  if (!window.ForceGraph3D || !window.SpriteText) {
    container.innerHTML = "<p class='muted graph-load-error'>3D 图谱库加载失败，请检查网络后刷新页面。</p>";
    return;
  }

  const categoryColors = {
    协议: "#38bdf8",
    设备: "#34d399",
    技术: "#a78bfa",
    机制: "#f59e0b",
    概念: "#fb7185",
    数据结构: "#2dd4bf",
    数据单位: "#818cf8",
    介质: "#94a3b8",
  };
  let graphItems = [];
  let selectedGraphNode = null;
  let highlightedNodeIds = new Set();
  let highlightedLinkIds = new Set();
  let baseNodes = [];
  let baseLinks = [];

  function buildGraphData(items) {
    const nodes = [
      {
        id: "root",
        name: withEnglish("计算机网络"),
        rawName: "计算机网络",
        group: "root",
        layer: "整体",
        category: "知识体系",
        unit: "TCP/IP 五层模型",
        summary: "计算机网络由应用层、传输层、网络层、数据链路层、物理层协作完成通信。",
        detail: "中心节点表示课程知识体系整体，向外连接五层模型，再连接协议、设备、技术、机制和概念。",
        relation: "中心节点连接 TCP/IP 五层模型。",
        level: 0,
        color: "#facc15",
      },
    ];
    const links = [];

    layerOrder.forEach((layer) => {
      const profile = layerProfiles[layer];
      nodes.push({
        id: `layer-${layer}`,
        name: withEnglish(layer),
        rawName: layer,
        group: "layer",
        layer,
        category: "网络层级",
        unit: annotateEnglishText(profile.units),
        summary: profile.intro,
        detail: profile.function,
        relation: profile.relation,
        level: 1,
        color: "#60a5fa",
      });
      links.push({ source: "root", target: `layer-${layer}`, label: "包含" });
    });

    items.forEach((item) => {
      nodes.push({
        id: `item-${item.id}`,
        name: withEnglish(item.title),
        rawName: item.title,
        group: item.category,
        layer: item.layer,
        category: item.category,
        unit: withEnglish(item.device_or_unit || "无"),
        summary: annotateEnglishText(item.summary),
        detail: annotateEnglishText(item.detail || item.summary),
        relation: `${withEnglish(item.title)} 属于 ${withEnglish(item.layer)}，是该层中的 ${withEnglish(item.category)} 知识点。`,
        level: 2,
        color: categoryColors[item.category] || "#cbd5e1",
      });
      links.push({ source: `layer-${item.layer}`, target: `item-${item.id}`, label: item.category });
    });

    return { nodes, links };
  }

  async function reloadBaseGraphData() {
    const all = await fetchJson("/api/knowledge?page_size=500");
    graphItems = all.items;
    const nextData = buildGraphData(graphItems);
    baseNodes = nextData.nodes;
    baseLinks = nextData.links;
    selectedGraphNode = baseNodes.find((node) => node.id === selectedGraphNode?.id) || baseNodes[0];
  }

  await reloadBaseGraphData();

  function graphWidth() {
    return container.clientWidth || 1040;
  }

  function graphHeight() {
    return container.clientHeight || 640;
  }

  const Graph = ForceGraph3D()(container)
    .width(graphWidth())
    .height(graphHeight())
    .backgroundColor("#f8fafc")
    .nodeId("id")
    .nodeLabel((node) => `${node.name}<br>${withEnglish(node.category)}<br>${node.summary}`)
    .nodeColor((node) => {
      if (highlightedNodeIds.size === 0) return node.color;
      return highlightedNodeIds.has(node.id) ? node.color : "#cbd5e1";
    })
    .nodeRelSize(6)
    .linkLabel((link) => withEnglish(link.label))
    .linkColor(() => "rgba(37, 99, 235, 0.32)")
    .linkWidth((link) => (highlightedLinkIds.has(linkId(link)) ? 3.2 : 1.2))
    .linkDirectionalParticles((link) => (highlightedLinkIds.has(linkId(link)) ? 4 : 1))
    .linkDirectionalParticleWidth((link) => (highlightedLinkIds.has(linkId(link)) ? 3 : 1.4))
    .linkThreeObjectExtend(true)
    .linkThreeObject((link) => {
      const sprite = new SpriteText(withEnglish(link.label));
      sprite.color = "#2563eb";
      sprite.textHeight = 4;
      sprite.backgroundColor = "rgba(255,255,255,0.78)";
      sprite.padding = 1.5;
      sprite.borderRadius = 2;
      return sprite;
    })
    .linkPositionUpdate((sprite, { start, end }) => {
      const middlePos = Object.assign(
        ...["x", "y", "z"].map((coord) => ({
          [coord]: start[coord] + (end[coord] - start[coord]) / 2,
        }))
      );
      Object.assign(sprite.position, middlePos);
    })
    .nodeThreeObjectExtend(true)
    .nodeThreeObject((node) => {
      const sprite = new SpriteText(node.name);
      sprite.color = node.level === 0 ? "#111827" : "#1f2937";
      sprite.textHeight = node.level === 0 ? 8 : node.level === 1 ? 6 : 4.2;
      sprite.position.y = node.level === 0 ? 16 : node.level === 1 ? 12 : 8;
      return sprite;
    })
    .onNodeClick((node) => {
      selectedGraphNode = baseNodes.find((item) => item.id === node.id) || node;
      showDetail(node);
      focusNode(node);
      highlightNeighborhood(node.id);
    })
    .onNodeRightClick((node) => {
      node.fx = undefined;
      node.fy = undefined;
      node.fz = undefined;
    })
    .enableNodeDrag(true)
    .showNavInfo(false)
    .cooldownTicks(120);

  Graph.d3Force("charge").strength(-180);
  Graph.d3Force("link").distance((link) => (String(link.source).includes("root") ? 150 : 92));
  Graph.d3Force("center").strength(0.18);

  function graphDataForDepth() {
    const depth = depthSelect.value;
    const selected = selectedGraphNode || baseNodes[0];
    const nodeIds = new Set();

    if (selected.id === "root") {
      nodeIds.add("root");
      if (Number(depth) >= 2) {
        layerOrder.forEach((layer) => nodeIds.add(`layer-${layer}`));
      }
      if (Number(depth) >= 3) {
        graphItems.forEach((item) => nodeIds.add(`item-${item.id}`));
      }
    } else if (selected.category === "网络层级") {
      nodeIds.add(selected.id);
      if (Number(depth) >= 2) {
        graphItems.filter((item) => item.layer === selected.layer).forEach((item) => nodeIds.add(`item-${item.id}`));
      }
      if (Number(depth) >= 3) {
        nodeIds.add("root");
      }
    } else {
      nodeIds.add(selected.id);
      if (Number(depth) >= 2) {
        nodeIds.add(`layer-${selected.layer}`);
      }
      if (Number(depth) >= 3) {
        nodeIds.add("root");
      }
    }

    return {
      nodes: baseNodes.filter((node) => nodeIds.has(node.id)),
      links: baseLinks.filter((link) => {
        const source = typeof link.source === "object" ? link.source.id : link.source;
        const target = typeof link.target === "object" ? link.target.id : link.target;
        return nodeIds.has(source) && nodeIds.has(target);
      }),
    };
  }

  function showDetail(node) {
    detailType.textContent = withEnglish(node.category);
    detailTitle.textContent = node.name;
    detailSummary.textContent = node.detail || node.summary;
    detailLayer.textContent = withEnglish(node.layer);
    detailCategory.textContent = withEnglish(node.category);
    detailUnit.textContent = node.unit;
    detailRelation.textContent = node.relation;
    graphToKnowledgeButton.disabled = !layerOrder.includes(node.layer);
    graphToKnowledgeButton.textContent = node.level === 2 ? "查看知识库条目" : node.level === 1 ? "查看该层知识库" : "查看知识库";
    graphToKnowledgeButton.onclick = () => openGraphNodeInKnowledge(node);
  }

  function focusNode(node) {
    const distance = node.level === 0 ? 340 : node.level === 1 ? 250 : 180;
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
    Graph.cameraPosition(
      { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
      node,
      850
    );
  }

  function highlightNeighborhood(nodeId) {
    const data = Graph.graphData();
    highlightedNodeIds = new Set([nodeId]);
    highlightedLinkIds = new Set();
    data.links.forEach((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      if (sourceId === nodeId || targetId === nodeId) {
        highlightedNodeIds.add(sourceId);
        highlightedNodeIds.add(targetId);
        highlightedLinkIds.add(linkId(link));
      }
    });
    Graph.graphData(data);
  }

  function linkId(link) {
    const sourceId = typeof link.source === "object" ? link.source.id : link.source;
    const targetId = typeof link.target === "object" ? link.target.id : link.target;
    return `${sourceId}->${targetId}`;
  }

  function applyDepth() {
    const data = graphDataForDepth();
    highlightedNodeIds = new Set();
    highlightedLinkIds = new Set();
    Graph.width(graphWidth());
    Graph.height(graphHeight());
    Graph.graphData(data);
    setTimeout(() => {
      Graph.zoomToFit(900, 120);
    }, 900);
  }

  function showCompleteGraph() {
    highlightedNodeIds = new Set();
    highlightedLinkIds = new Set();
    Graph.width(graphWidth());
    Graph.height(graphHeight());
    Graph.graphData({
      nodes: baseNodes,
      links: baseLinks,
    });
  }

  window.focusKnowledgeGraphItem = (itemId) => {
    const node = baseNodes.find((item) => item.id === `item-${itemId}`);
    if (!node) return;
    pendingGraphFocusId = null;
    selectedGraphNode = node;
    depthSelect.value = "3";
    showCompleteGraph();
    window.setTimeout(() => {
      const liveNode = Graph.graphData().nodes.find((item) => item.id === node.id) || node;
      showDetail(node);
      focusNode(liveNode);
      highlightNeighborhood(node.id);
    }, 950);
  };

  window.refreshKnowledgeGraph = async () => {
    const currentData = Graph.graphData();
    const currentNodeIds = new Set(currentData.nodes.map((node) => node.id));
    const wasShowingCompleteGraph = currentNodeIds.size === baseNodes.length;
    const previousHighlightedNodeIds = new Set(highlightedNodeIds);
    const previousHighlightedLinkIds = new Set(highlightedLinkIds);
    await reloadBaseGraphData();
    highlightedNodeIds = new Set([...previousHighlightedNodeIds].filter((id) => baseNodes.some((node) => node.id === id)));
    highlightedLinkIds = new Set([...previousHighlightedLinkIds].filter((id) => {
      return baseLinks.some((link) => linkId(link) === id);
    }));
    const nextData = wasShowingCompleteGraph
      ? { nodes: baseNodes, links: baseLinks }
      : {
          nodes: baseNodes.filter((node) => currentNodeIds.has(node.id)),
          links: baseLinks.filter((link) => {
            const source = typeof link.source === "object" ? link.source.id : link.source;
            const target = typeof link.target === "object" ? link.target.id : link.target;
            return currentNodeIds.has(source) && currentNodeIds.has(target);
          }),
        };
    Graph.width(graphWidth());
    Graph.height(graphHeight());
    Graph.graphData(nextData.nodes.length ? nextData : graphDataForDepth());
    if (selectedGraphNode) {
      showDetail(selectedGraphNode);
    }
  };

  window.resizeKnowledgeGraph = () => {
    Graph.width(graphWidth());
    Graph.height(graphHeight());
    window.setTimeout(() => Graph.zoomToFit(300, 120), 120);
  };

  depthSelect.onchange = applyDepth;
  document.querySelector("#resetGraph").onclick = () => {
    selectedGraphNode = baseNodes[0];
    highlightedNodeIds = new Set();
    highlightedLinkIds = new Set();
    depthSelect.value = "3";
    showDetail(baseNodes[0]);
    applyDepth();
  };
  showDetail(baseNodes[0]);
  selectedGraphNode = baseNodes[0];
  applyDepth();
  if (pendingGraphFocusId) {
    window.setTimeout(() => window.focusKnowledgeGraphItem?.(pendingGraphFocusId), 300);
  }
  window.addEventListener("resize", () => {
    window.resizeKnowledgeGraph?.();
  });
}

async function boot() {
  setupProtocolTabs();
  setupDnsDemo();
  setupTcpDemo();
  setupArpDemo();
  setupSwitchingDemo();
  setupScenarioFramework();
  setupKnowledgeLibrary();
  setupCatalogActiveState();

  let graphReady = null;
  function ensureGraphReady() {
    if (!graphReady) {
      graphReady = setup3DKnowledgeGraph().catch((error) => {
        graphReady = null;
        throw error;
      });
    }
    return graphReady;
  }

  if ((window.location.hash || "#overview") === "#graph") {
    await ensureGraphReady();
  }
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#graph") {
      ensureGraphReady()
        .then(() => window.resizeKnowledgeGraph?.())
        .catch((error) => {
          document.querySelector("#knowledgeGraph3d").innerHTML = `<p class="muted graph-load-error">${escapeHtml(error.message)}</p>`;
        });
    }
  });
}

boot().catch((error) => {
  knowledgeList.innerHTML = `<p class="muted">${error.message}</p>`;
});
