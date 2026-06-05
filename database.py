from pathlib import Path
import sqlite3


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "network_knowledge.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


SEED_POINTS = [
    ("应用层", "HTTP", "协议", "用于浏览器和 Web 服务器之间传输超文本数据。", "HTTP 工作在应用层，采用请求-响应模型，常见方法包括 GET、POST、PUT、DELETE。HTTP 本身不负责可靠传输，通常依赖 TCP 或 QUIC。", "报文"),
    ("应用层", "HTTPS", "协议", "在 HTTP 基础上加入 TLS 加密保护。", "HTTPS 通过证书认证、密钥协商和加密传输保护 Web 通信的机密性、完整性和身份可信性。", "加密报文"),
    ("应用层", "DNS", "协议", "将域名解析为 IP 地址。", "DNS 通过递归查询或迭代查询完成域名解析，并可利用缓存减少重复查询。常见记录包括 A、AAAA、CNAME、MX、NS。", "域名/IP"),
    ("应用层", "FTP", "协议", "用于文件上传和下载。", "FTP 通常区分控制连接和数据连接，控制连接负责登录与命令，数据连接负责实际文件传输。", "文件/命令"),
    ("应用层", "SMTP", "协议", "用于发送电子邮件。", "SMTP 负责邮件从客户端到邮件服务器、服务器到服务器之间的传递，接收邮件通常配合 POP3 或 IMAP。", "邮件报文"),
    ("应用层", "DHCP", "协议", "自动为主机分配 IP 地址和网络配置。", "DHCP 通过 Discover、Offer、Request、Ack 等阶段为主机分配 IP、网关、DNS 服务器等参数。", "配置报文"),
    ("应用层", "Socket 编程接口", "技术", "应用程序使用网络服务的编程接口。", "Socket 把传输层通信能力暴露给应用程序，开发者可通过 IP、端口和协议类型建立网络通信。", "套接字"),
    ("传输层", "TCP", "协议", "提供可靠的、面向连接的字节流传输。", "TCP 通过三次握手建立连接，通过序号、确认、重传、滑动窗口、拥塞控制和四次挥手管理可靠通信。", "报文段"),
    ("传输层", "UDP", "协议", "提供无连接、低开销的数据报传输。", "UDP 不保证可靠交付、顺序和拥塞控制，适合 DNS 查询、实时音视频、游戏和广播类场景。", "用户数据报"),
    ("传输层", "端口号", "概念", "用于区分同一主机上的不同进程。", "IP 地址定位主机，端口号定位主机上的应用进程。常见端口包括 HTTP 80、HTTPS 443、DNS 53。", "端口"),
    ("传输层", "滑动窗口", "机制", "控制发送方可连续发送的数据量。", "滑动窗口用于实现流量控制和提高链路利用率，接收方通过窗口大小告知自身接收能力。", "窗口"),
    ("传输层", "拥塞控制", "机制", "避免过多数据注入网络造成拥塞。", "TCP 拥塞控制包括慢开始、拥塞避免、快重传和快恢复等机制，根据网络反馈调整发送速率。", "拥塞窗口"),
    ("传输层", "三次握手", "机制", "TCP 建立连接的过程。", "三次握手确认双方收发能力和初始序号：SYN、SYN+ACK、ACK，完成后进入 ESTABLISHED 状态。", "SYN/ACK"),
    ("传输层", "四次挥手", "机制", "TCP 释放连接的过程。", "由于 TCP 是全双工通信，双方需要分别关闭发送方向，因此通常需要 FIN、ACK、FIN、ACK 四个阶段。", "FIN/ACK"),
    ("网络层", "IP", "协议", "负责跨网络寻址和路由转发。", "IP 数据报包含源 IP、目的 IP、TTL、协议号等字段，路由器根据目的地址和路由表选择下一跳。", "数据报"),
    ("网络层", "IPv4 地址", "概念", "32 位网络层地址。", "IPv4 地址通常写成点分十进制形式，可结合子网掩码划分网络号和主机号。", "IP 地址"),
    ("网络层", "IPv6 地址", "概念", "128 位网络层地址。", "IPv6 扩大地址空间，并支持更简洁的报头、自动配置和更好的扩展能力。", "IP 地址"),
    ("网络层", "路由器", "设备", "连接不同网络并转发 IP 数据报。", "路由器工作在网络层，根据目的 IP 地址和路由表决定转发路径，同时隔离二层广播域。", "路由表"),
    ("网络层", "路由表", "数据结构", "记录目的网络与下一跳关系。", "路由表通常包含目的网络、子网掩码、下一跳、出接口和度量值，最长前缀匹配用于选择最具体的路由。", "表项"),
    ("网络层", "ICMP", "协议", "用于网络控制和差错报告。", "ICMP 常见于 ping 和 traceroute，用于回显请求、目的不可达、TTL 超时等网络诊断场景。", "控制报文"),
    ("网络层", "NAT", "技术", "实现私有地址与公网地址转换。", "NAT 允许内网主机共享公网地址访问 Internet，也会影响端到端连接和部分协议穿透。", "地址映射"),
    ("数据链路层", "ARP", "协议", "根据 IP 地址查询对应的 MAC 地址。", "ARP 请求通常以广播方式发送，ARP 应答以单播方式返回，结果写入 ARP 缓存表。", "帧/MAC 地址"),
    ("数据链路层", "以太网帧", "数据单位", "局域网中传输的数据链路层数据单元。", "以太网帧包含目的 MAC、源 MAC、类型字段、数据载荷和 FCS 校验字段。", "帧"),
    ("数据链路层", "MAC 地址", "概念", "网络接口的数据链路层地址。", "MAC 地址通常为 48 位，用于同一局域网内的帧转发和设备识别。", "MAC"),
    ("数据链路层", "交换机", "设备", "根据 MAC 地址表转发以太网帧。", "交换机会学习源 MAC 地址所在端口，目的 MAC 未知时进行泛洪，已知时定向转发。", "以太网帧"),
    ("数据链路层", "MAC 地址表", "数据结构", "记录 MAC 地址与交换机端口的对应关系。", "交换机通过收到帧的源 MAC 学习表项，并根据目的 MAC 查询表项决定转发端口。", "表项"),
    ("数据链路层", "VLAN", "技术", "在交换网络中划分逻辑广播域。", "VLAN 可把同一物理交换网络划分为多个逻辑网络，减少广播范围并提升管理灵活性。", "标签帧"),
    ("数据链路层", "差错检测", "机制", "发现帧在传输中的错误。", "以太网使用 FCS/CRC 检测帧错误，发现错误后通常丢弃，由上层协议决定是否重传。", "FCS"),
    ("物理层", "比特流", "数据单位", "网络中最底层传输的 0 和 1。", "物理层负责把比特转换为电信号、光信号或无线电波，并在传输介质上传送。", "比特"),
    ("物理层", "双绞线", "介质", "常见的有线传输介质。", "双绞线通过成对绞合降低电磁干扰，常见于以太网接入环境。", "电信号"),
    ("物理层", "光纤", "介质", "使用光信号传输数据的介质。", "光纤具有带宽高、损耗低、抗干扰能力强等特点，适合骨干网和长距离传输。", "光信号"),
    ("物理层", "无线信道", "介质", "通过无线电波传输数据。", "无线信道容易受到距离、障碍物、干扰和共享介质竞争影响，常见于 Wi-Fi 和蜂窝网络。", "无线电波"),
    ("物理层", "集线器", "设备", "早期物理层转发设备。", "集线器不识别帧和地址，只把收到的电信号复制到其他端口，所有端口共享冲突域。", "比特流"),
    ("物理层", "带宽", "概念", "链路理论或实际可承载的数据速率。", "带宽通常用 bit/s 表示，影响单位时间内可传输的数据量，但不等同于时延。", "bit/s"),
    ("物理层", "编码与调制", "技术", "把数字比特转换成适合介质传输的信号。", "编码关注比特到信号的表示，调制关注信号承载方式，是物理层实现可靠传输的基础。", "信号"),
]


def get_connection():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        conn.executemany(
            """
            INSERT OR IGNORE INTO knowledge_points
                (layer, title, category, summary, detail, device_or_unit)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            SEED_POINTS,
        )


def list_layers():
    return ["应用层", "传输层", "网络层", "数据链路层", "物理层"]


def list_knowledge(layer=None, q="", page=1, page_size=8):
    page = max(int(page), 1)
    page_size = max(min(int(page_size), 500), 1)
    offset = (page - 1) * page_size
    filters = []
    params = []

    if layer:
        filters.append("layer = ?")
        params.append(layer)
    if q:
        filters.append("(title LIKE ? OR summary LIKE ? OR detail LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like, like])

    where = " WHERE " + " AND ".join(filters) if filters else ""
    with get_connection() as conn:
        total = conn.execute(
            f"SELECT COUNT(*) FROM knowledge_points{where}", params
        ).fetchone()[0]
        rows = conn.execute(
            f"""
            SELECT id, layer, title, category, summary, detail, device_or_unit, updated_at
            FROM knowledge_points
            {where}
            ORDER BY layer, id
            LIMIT ? OFFSET ?
            """,
            [*params, page_size, offset],
        ).fetchall()
    return {
        "items": [dict(row) for row in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def create_knowledge(data):
    required = ["layer", "title", "category", "summary", "detail"]
    for key in required:
        if not data.get(key, "").strip():
            raise ValueError(f"{key} 不能为空")
    if data["layer"] not in list_layers():
        raise ValueError("layer 不在 TCP/IP 五层模型范围内")

    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO knowledge_points
                (layer, title, category, summary, detail, device_or_unit)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                data["layer"].strip(),
                data["title"].strip(),
                data["category"].strip(),
                data["summary"].strip(),
                data["detail"].strip(),
                data.get("device_or_unit", "").strip(),
            ),
        )
        item_id = cursor.lastrowid
        conn.commit()
    return get_knowledge(item_id)


def update_knowledge(item_id, data):
    required = ["layer", "title", "category", "summary", "detail"]
    for key in required:
        if not data.get(key, "").strip():
            raise ValueError(f"{key} 不能为空")
    if data["layer"] not in list_layers():
        raise ValueError("layer 不在 TCP/IP 五层模型范围内")

    with get_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE knowledge_points
            SET layer = ?,
                title = ?,
                category = ?,
                summary = ?,
                detail = ?,
                device_or_unit = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                data["layer"].strip(),
                data["title"].strip(),
                data["category"].strip(),
                data["summary"].strip(),
                data["detail"].strip(),
                data.get("device_or_unit", "").strip(),
                int(item_id),
            ),
        )
        if cursor.rowcount == 0:
            raise KeyError("知识点不存在")
        conn.commit()
    return get_knowledge(item_id)


def delete_knowledge(item_id):
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM knowledge_points WHERE id = ?", (int(item_id),))
        if cursor.rowcount == 0:
            raise KeyError("知识点不存在")
    return {"deleted": int(item_id)}


def get_knowledge(item_id):
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT id, layer, title, category, summary, detail, device_or_unit, updated_at
            FROM knowledge_points
            WHERE id = ?
            """,
            (int(item_id),),
        ).fetchone()
    if not row:
        raise KeyError("知识点不存在")
    return dict(row)
