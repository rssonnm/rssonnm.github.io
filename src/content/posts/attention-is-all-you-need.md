---
title: "Attention Is All You Need"
date: 2026-08-10
description: "Bài báo \"Attention Is All You Need\" (Vaswani và đồng nghiệp, 2017) đề xuất Transformer, một kiến trúc xử lý chuỗi dựa hoàn toàn vào cơ chế attention, bỏ truy hồi và tích chập. Bài viết này đọc lại bài báo dưới góc độ toán học: phân tích và chứng minh từng công thức cùng từng lựa chọn thiết kế — hệ số √d_k, mã hóa vị trí, chuẩn hóa, toán huấn luyện — rồi mở rộng sang các kết quả lý thuyết mà bài báo đã khơi nguồn: sức mạnh biểu diễn, tổng quát hóa, và hệ động lực của luồng dư."
topic: ai
tags: [deep-learning, transformers, attention, kernel-methods, information-theory, mathematics]
featured: false
draft: false
---

Năm 2017, Vaswani và các đồng nghiệp công bố tại NeurIPS bài báo "Attention Is All You Need" [^1], đề xuất kiến trúc Transformer — kiến trúc xử lý chuỗi dựa hoàn toàn trên cơ chế attention, không sử dụng truy hồi (recurrence) và tích chập (convolution). Kiến trúc này trở thành nền tảng của hầu hết các mô hình ngôn ngữ lớn và mô hình thị giác hiện đại.

Bài báo ngắn nhưng chứa nhiều nội dung toán học: bốn công thức được đánh số, một bảng phân tích độ phức tạp, và một loạt lựa chọn thiết kế — hệ số tỉ lệ $\sqrt{d_k}$, mã hóa vị trí hình sin, làm trơn nhãn, lịch trình tốc độ học — thường được tiếp nhận như kiến thức thực hành hơn là kết quả lý thuyết. Bài viết này phân tích từng công thức của bài báo dưới góc độ toán học: mỗi công thức được đặt trong một định nghĩa, mỗi lựa chọn thiết kế được diễn giải qua một bổ đề hoặc một mệnh đề, và các luận điểm heuristic của bài báo — chẳng hạn "các tích vô hướng tăng về độ lớn, đẩy hàm softmax vào vùng có gradient rất nhỏ" — được phát biểu thành các khẳng định có thể chứng minh. Các công cụ cần dùng chỉ gồm đại số tuyến tính, lý thuyết xác suất và một phần lý thuyết thông tin.

## Bản đồ bài viết: bốn tầng kiến thức

Bài viết được tổ chức thành bốn tầng, mỗi tầng kết thúc ở một mức độ hiểu biết riêng:

- **Tầng 0 — Hộp công cụ toán học.** Đại số tuyến tính, xác suất, giải tích nhiều biến, hàm softmax, lý thuyết thông tin và một chút lý thuyết kernel, được trình bày đúng lượng cần cho phần còn lại. Người đã vững có thể bỏ qua; người mới nên đọc kỹ, vì mọi khẳng định ở các tầng sau đều dùng đúng các công cụ này.
- **Tầng 1 — Cơ chế.** Công thức (1) và (2) của bài báo: attention tích vô hướng có tỉ lệ, bổ đề phương sai đằng sau hệ số $\sqrt{d_k}$, và attention đa đầu như tổ hợp các phép làm trơn hạng thấp.
- **Tầng 2 — Kiến trúc.** Self-attention và tính đẳng biến hoán vị, mã hóa vị trí, mạng truyền thẳng, kết nối dư và chuẩn hóa, toán huấn luyện — toàn bộ mô hình như một hệ thống hoàn chỉnh.
- **Tầng 3 — Nâng cao.** Sáu mảng lý thuyết ở mức độ sau đại học: sức mạnh biểu diễn (xấp xỉ phổ dụng, Turing đầy đủ, giới hạn), lý thuyết tổng quát hóa (độ phức tạp Rademacher), hình học thông tin (đối ngẫu Legendre, phân phối Gibbs, vận chuyển tối ưu entropy), lý thuyết phổ của chuỗi Markov attention (Perron–Frobenius, hệ số Dobrushin), kernel và không gian Hilbert tái tạo (đặc trưng ngẫu nhiên, attention tuyến tính), và hệ động lực của luồng dư.

Mỗi tầng độc lập tương đối: người đã biết toán có thể vào thẳng Tầng 1; người muốn hiểu vì sao transformer huấn luyện được nên đọc cả bốn. Các khối **Definition / Lemma / Theorem / Proposition / Remark / Proof** là ngôn ngữ chính của bài viết: mỗi khối là một khẳng định có thể kiểm chứng, và mỗi chứng minh được viết đầy đủ ở mức có thể làm theo từng dòng.

## Tầng 0 — Hộp công cụ toán học

### Đại số tuyến tính

Mọi phép tính trong transformer là phép toán trên vector và ma trận. Năm khái niệm sau đây được dùng ở khắp nơi trong bài.

```definition[Vector, tổ hợp tuyến tính, độc lập]
Một vector $x \in \mathbb{R}^d$ là một bộ $d$ số thực. Một tổ hợp tuyến tính của $v_1, \dots, v_k$ là một vector $\sum_i c_i v_i$ với $c_i \in \mathbb{R}$. Các vector độc lập tuyến tính khi không vector nào biểu diễn được thành tổ hợp tuyến tính của các vector còn lại; bao tuyến tính $\operatorname{span}\{v_1,\dots,v_k\}$ là tập mọi tổ hợp tuyến tính — một không gian con.
```

```definition[Tích vô hướng, chuẩn, góc]
Tích vô hướng chuẩn tắc trên $\mathbb{R}^d$ là $\langle x, y \rangle = \sum_{i=1}^d x_i y_i = x^\top y$. Chuẩn Euclidean là $\|x\| = \sqrt{\langle x, x \rangle}$. Góc $\theta$ giữa hai vector thỏa
$$\cos\theta = \frac{\langle x, y\rangle}{\|x\|\,\|y\|}.$$
```

```theorem[Bất đẳng thức Cauchy–Schwarz]
Với mọi $x, y \in \mathbb{R}^d$: $|\langle x, y\rangle| \le \|x\|\,\|y\|$, đẳng thức xảy ra khi và chỉ khi $x$ và $y$ phụ thuộc tuyến tính.
```

```proof
Với mọi $t \in \mathbb{R}$, xét $\|x - t y\|^2 = \|x\|^2 - 2t\langle x,y\rangle + t^2\|y\|^2 \ge 0$. Chọn $t = \langle x,y\rangle/\|y\|^2$ (nếu $y \ne 0$) được $\|x\|^2 - \langle x,y\rangle^2/\|y\|^2 \ge 0$, tức $\langle x,y\rangle^2 \le \|x\|^2\|y\|^2$.
```

```example[Vì sao tích vô hướng đo "độ khớp"]
Trong attention, logit giữa truy vấn $q$ và khóa $k$ là $q^\top k = \|q\|\|k\|\cos\theta$: nó lớn khi hai vector cùng hướng. Nếu vector biểu diễn nghĩa của một token, tích vô hướng lớn nghĩa là hai token "có liên quan theo hướng mà mô hình đã học". Cauchy–Schwarz chặn độ lớn của logit bởi tích chuẩn — một dữ kiện sẽ quay lại ở bổ đề phương sai (Tầng 1).
```

```definition[Ma trận và các phép toán]
Ma trận $A \in \mathbb{R}^{n \times m}$ là một mảng $n \times m$ số thực. Tích $AB$ (với $A \in \mathbb{R}^{n\times m}$, $B \in \mathbb{R}^{m\times p}$) có phần tử $(AB)_{ij} = \sum_{k} A_{ik}B_{kj}$. Chuyển vị $A^\top$ đổi chỗ hàng và cột. Ma trận vuông $A$ có vết $\operatorname{tr}(A) = \sum_i A_{ii}$.
```

```definition[Trị riêng, vector riêng]
Với ma trận vuông $A$, số $\lambda$ là trị riêng và $v \ne 0$ là vector riêng tương ứng nếu $Av = \lambda v$. Ma trận $A$ đối xứng ($A = A^\top$) có mọi trị riêng thực.
```

```theorem[Phân tích phổ của ma trận đối xứng]
Mọi ma trận đối xứng $A \in \mathbb{R}^{d\times d}$ viết được thành $A = U\Lambda U^\top$ với $U$ trực giao ($U^\top U = I$) và $\Lambda$ chéo chứa các trị riêng. Nói riêng, các vector riêng của ma trận đối xứng trực giao với nhau và lập thành một cơ sở.
```

```definition[Ma trận xác định dương và ma trận Gram]
Ma trận đối xứng $M$ là bán xác định dương nếu $x^\top M x \ge 0$ với mọi $x$ (xác định dương nếu bất đẳng thức ngặt với $x \ne 0$); điều này tương đương với mọi trị riêng không âm (dương). Với mọi ma trận $X \in \mathbb{R}^{n\times d}$, ma trận Gram $XX^\top$ là bán xác định dương và $\operatorname{rank}(XX^\top) \le d$.
```

```remark
Phần tử $(QK^\top)_{ij} = q_i^\top k_j$ trong attention là một ma trận các tích vô hướng chéo (truy vấn với khóa, hai họ vector khác nhau); còn $XX^\top$ với $X$ là các biểu diễn token là một ma trận Gram thật sự: bán xác định dương, hạng không vượt quá chiều đặc trưng. Nhận xét hạng này là chìa khóa cho mệnh đề "attention đa đầu không tốn thêm chi phí": một tương tác hạng đầy đủ $d_{\text{model}}$ được thay bằng $h$ tương tác hạng $d_k$ chạy song song.
```

### Xác suất

Attention là một phép lấy trung bình theo phân phối xác suất; toàn bộ lập luận về $\sqrt{d_k}$ là một lập luận xác suất.

```definition[Biến ngẫu nhiên, kỳ vọng, phương sai]
Biến ngẫu nhiên $Z$ là một đại lượng nhận giá trị theo một phân phối xác suất. Kỳ vọng $\mathbb{E}[Z]$ là giá trị trung bình; phương sai $\operatorname{Var}(Z) = \mathbb{E}[(Z - \mathbb{E}[Z])^2] = \mathbb{E}[Z^2] - \mathbb{E}[Z]^2$ đo độ phân tán; độ lệch chuẩn là $\sqrt{\operatorname{Var}(Z)}$. Hai biến $X, Y$ độc lập khi phân phối chung phân tích được thành tích của hai phân phối riêng; khi đó $\mathbb{E}[XY] = \mathbb{E}[X]\mathbb{E}[Y]$ và $\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$.
```

```theorem[Định lý giới hạn trung tâm]
Cho $Z_1, \dots, Z_n$ độc lập cùng phân phối với kỳ vọng $\mu$ và phương sai $\sigma^2$. Khi $n \to \infty$,
$$\frac{1}{\sqrt{n}}\sum_{i=1}^{n}(Z_i - \mu) \;\xrightarrow{d}\; \mathcal{N}(0, \sigma^2),$$
phân phối chuẩn với kỳ vọng $0$ và phương sai $\sigma^2$: tổng của nhiều biến độc lập "tự chuẩn hóa" thành hình chuông.
```

```theorem[Bất đẳng thức Chebyshev]
Với biến ngẫu nhiên $X$ có kỳ vọng $\mu$ và phương sai $\sigma^2$, với mọi $t > 0$:
$$\mathbb{P}(|X - \mu| \ge t) \le \frac{\sigma^2}{t^2}.$$
```

```proof
Đây là hệ quả của bất đẳng thức Markov: $\mathbb{P}(|X-\mu| \ge t) = \mathbb{P}((X-\mu)^2 \ge t^2) \le \mathbb{E}[(X-\mu)^2]/t^2 = \sigma^2/t^2$.
```

```remark[Concentration là nền tảng của lập luận $\sqrt{d_k}$]
Định lý giới hạn trung tâm nói tổng $d_k$ số hạng độc lập có độ phân tán cỡ $\sqrt{d_k}$; Chebyshev nói xác suất lệch khỏi kỳ vọng nhiều hơn vài độ lệch chuẩn là nhỏ. Cùng nhau, chúng cho biết chính xác các logit $q_i^\top k_j$ "cỡ bao nhiêu" và "cách xa nhau bao nhiêu" — hai con số quyết định xem softmax có bão hòa hay không (Tầng 1). Khái niệm hội tụ theo xác suất ($X_n \xrightarrow{p} X$ khi $\mathbb{P}(|X_n - X| \ge \varepsilon) \to 0$) là ngôn ngữ của mệnh đề bão hòa.
```

### Giải tích nhiều biến

```definition[Gradient, Jacobian, quy tắc dây chuyền]
Cho $f: \mathbb{R}^d \to \mathbb{R}$. Gradient $\nabla f(x)$ là vector các đạo hàm riêng $(\partial f/\partial x_1, \dots, \partial f/\partial x_d)$; nó chỉ hướng tăng nhanh nhất và vuông góc với đường mức. Cho $f: \mathbb{R}^d \to \mathbb{R}^m$, ma trận Jacobi $J_f(x) \in \mathbb{R}^{m\times d}$ có phần tử $(J_f)_{ij} = \partial f_i/\partial x_j$. Quy tắc dây chuyền: $J_{g \circ f}(x) = J_g(f(x))\, J_f(x)$ — gradient lan truyền qua hợp thành bằng phép nhân ma trận Jacobi.
```

```remark[Lan truyền ngược là quy tắc dây chuyền]
Một mạng nơ-ron là một hợp thành $f = f_L \circ \cdots \circ f_1$; đạo hàm của hàm mất mát theo mọi tham số là một chuỗi các phép nhân Jacobi chạy ngược từ đầu ra — quy tắc dây chuyền được tính toán trên đồ thị. "Gradient biến mất" nghĩa là tích các Jacobi co về không theo độ sâu; "bùng nổ gradient" nghĩa là tích đó phình to. Mọi thiết kế trong bài báo — hệ số $\sqrt{d_k}$, kết nối dư, chuẩn hóa — đều nhắm vào việc giữ các tích Jacobi này ở thang độ khả dụng (Tầng 2).
```

### Softmax và hàm mũ

```definition[Đơn hình, softmax, log-sum-exp]
Đơn hình chuẩn $\Delta^{m-1} = \{p \in \mathbb{R}^m : p_j \ge 0,\; \sum_j p_j = 1\}$ là tập các phân phối xác suất rời rạc trên $m$ điểm — bao lồi của $m$ vector cơ sở, có đỉnh là các phân phối one-hot. Softmax là ánh xạ
$$\operatorname{softmax}(z)_j = \frac{e^{z_j}}{\sum_{l} e^{z_l}},$$
và log-sum-exp là $\operatorname{LSE}(z) = \log \sum_j e^{z_j}$. Ba đối tượng này là ba mặt của cùng một đồng xu: $p = \operatorname{softmax}(z)$ kéo theo $z_j = \log p_j + \operatorname{LSE}(z)$.
```

```lemma[Phép tịnh tiến: ổn định số]
Với mọi $c \in \mathbb{R}$: $\operatorname{softmax}(z + c\mathbf{1}) = \operatorname{softmax}(z)$ và $\operatorname{LSE}(z + c\mathbf{1}) = \operatorname{LSE}(z) + c$. Do đó tính $\operatorname{LSE}(z)$ bằng cách trừ đi $\max_j z_j$ trước — tránh tràn số mũ.
```

```proof
Mọi $e^{z_j}$ nhân thêm $e^c$: tử số và mẫu số cùng nhân với $e^c$, triệt tiêu; logarit của $e^c$ là $c$.
```

```lemma[Softmax là nghiệm của bài toán cực đại entropy]
Với mọi vector $z \in \mathbb{R}^m$,
$$\operatorname{softmax}(z) = \operatorname*{arg\,max}_{p \in \Delta^{m-1}} \left\{ z \cdot p + H(p) \right\},$$
trong đó $H(p) = -\sum_j p_j \log p_j$ là entropy (định nghĩa dưới). Softmax là phép "$\arg\max$ mềm": nó chọn điểm trên đơn hình cực đại hóa điểm số tuyến tính $z \cdot p$ đồng thời giữ entropy — kết quả luôn nằm trong đơn hình, không bao giờ chạm đỉnh.
```

```proof
Viết nhân tử Lagrange: $L(p) = z\cdot p - \sum_j p_j\log p_j + \lambda(\sum_j p_j - 1)$. Đạo hàm theo $p_j$: $z_j - \log p_j - 1 + \lambda = 0$, suy ra $p_j = e^{z_j + \lambda - 1}$ — tỉ lệ với $e^{z_j}$. Chuẩn hóa được $p = \operatorname{softmax}(z)$. Entropy lồi chặt nên nghiệm duy nhất.
```

```remark
Bổ đề này là mảnh đầu tiên của bức tranh "attention là cân bằng nhiệt": softmax xuất hiện một cách tất yếu mỗi khi ta cực đại hóa một điểm số tuyến tính dưới phạt entropy. Ở Tầng 3 ta gặp lại đúng cấu trúc này dưới tên phân phối Gibbs và vận chuyển tối ưu entropy.
```

### Lý thuyết thông tin

```definition[Entropy, entropy chéo, phân kỳ KL]
Cho phân phối $p$ trên $m$ điểm. Entropy $H(p) = -\sum_j p_j \log p_j$ đo độ bất định ($H = \log m$ khi $p$ đều, $H = 0$ khi $p$ one-hot). Entropy chéo $H(p, q) = -\sum_j p_j \log q_j$ đo chi phí trung bình khi mã hóa dữ liệu từ $p$ bằng mô hình $q$. Phân kỳ Kullback–Leibler
$$D_{\mathrm{KL}}(p \,\|\, q) = \sum_j p_j \log \frac{p_j}{q_j} = H(p,q) - H(p)$$
đo "khoảng cách" (không đối xứng) từ $q$ đến $p$.
```

```theorem[Bất đẳng thức Gibbs]
$D_{\mathrm{KL}}(p \,\|\, q) \ge 0$, đẳng thức khi và chỉ khi $p = q$.
```

```proof
Vì $-\log$ lồi chặt, bất đẳng thức Jensen cho $-D_{\mathrm{KL}}(p\|q) = \sum_j p_j \log(q_j/p_j) \le \log \sum_j p_j (q_j/p_j) = \log 1 = 0$.
```

```example[Cross-entropy là hàm mất mát của bài báo]
Mất mát huấn luyện $L = -\sum_j y_j \log p_j$ với $y$ one-hot tại lớp đúng $c$ chính là $-\log p_c = H(y, p)$ — entropy chéo giữa nhãn và dự đoán. Làm trơn nhãn (Tầng 2) thay $y$ bằng phối trộn với phân phối đều, thêm vào mất mát một số hạng $D_{\mathrm{KL}}(u \,\|\, p)$ — một phạt kéo $p$ về phía đều.
```

```remark[Entropy và thông tin]
Entropy của một hàng attention đo lượng thông tin phép đọc thực sự dùng: $H = \log m$ là "đọc mọi thứ như nhau", $H = 0$ là "đọc đúng một vị trí". Sụp đổ entropy — một chẩn đoán quan trọng của transformer sâu — là khi $H$ tiến về $0$ trên vài vị trí; phần Tầng 3 giải thích hiện tượng này bằng lý thuyết chuỗi Markov.
```

### Kernel và ánh xạ đặc trưng

```definition[Kernel xác định dương]
Hàm $k: X \times X \to \mathbb{R}$ là kernel xác định dương nếu với mọi tập hữu hạn $x_1, \dots, x_n$, ma trận Gram $[k(x_i, x_j)]_{ij}$ bán xác định dương. Khi đó tồn tại một không gian Hilbert $H$ (không gian Hilbert tái tạo, RKHS) và một ánh xạ đặc trưng $\varphi: X \to H$ sao cho
$$k(x, y) = \langle \varphi(x), \varphi(y) \rangle_H.$$
```

```example[Kernel mũ của attention]
Với $X = \mathbb{R}^{d_k}$, hàm $k(q, k) = e^{q^\top k / \sqrt{d_k}}$ là kernel xác định dương — chính là tử số của trọng số attention trước chuẩn hóa. Nhìn attention như hồi quy Nadaraya–Watson (Tầng 1) là nhìn nó như phép làm trơn kernel; còn việc thay kernel bằng ánh xạ đặc trưng hữu hạn chiều là con đường dẫn tới attention tuyến tính (Tầng 3).
```

Hộp công cụ đã đủ. Người đọc đã nắm năm khối trên có thể theo dõi mọi lập luận của bài viết; bây giờ ta vào cơ chế.

## Bài toán chuyển đổi chuỗi và hạn chế của kiến trúc truy hồi

Bài toán mà bài báo giải quyết là chuyển đổi chuỗi (sequence transduction): ánh xạ một chuỗi đầu vào $(x_1, \dots, x_n)$ thành một chuỗi đầu ra $(y_1, \dots, y_m)$ — dịch máy, tóm tắt, và về sau là mô hình hóa ngôn ngữ. Trước năm 2017, mô hình chủ đạo là mạng truy hồi (recurrent network), trong đó trạng thái ẩn được cập nhật lần lượt theo từng vị trí,

$$
h_t = f(h_{t-1}, x_t),
$$

và mọi thông tin về quá khứ chỉ được truyền qua chuỗi các trạng thái ẩn. Cơ chế attention xuất hiện như một cải tiến: thay vì nén toàn bộ chuỗi đầu vào vào một trạng thái cuối cùng, bộ giải mã đọc một tổ hợp mềm của tất cả trạng thái của bộ mã hóa, với trọng số tính từ một hàm tương hợp học được [^2].

Xét về mặt cấu trúc, kiến trúc truy hồi có ba hạn chế:

1. **Mang tính tuần tự.** Trạng thái $h_t$ không thể tính trước khi $h_{t-1}$ được tính. Do đó việc xử lý $n$ vị trí cần $n$ bước thời gian bất kể số bộ xử lý. Bài báo gọi đây là số phép toán tuần tự (sequential operations): $O(n)$.
2. **Các vị trí xa nhau trao đổi thông tin chậm.** Một tín hiệu từ vị trí $1$ phải đi qua $n-1$ bước cập nhật trạng thái ẩn để đến vị trí $n$. Độ dài đường truyền tối đa (maximum path length) — số phép toán mà một đơn vị thông tin phải đi qua — là $O(n)$. Đường truyền dài dẫn đến gradient biến mất và mất thông tin; đây là nội dung toán học của "vấn đề phụ thuộc xa".
3. **Attention cộng của Bahdanau và cộng sự không phân rã được thành tích ma trận.** Hàm tương hợp $a(q,k) = v^\top \tanh(W_1 q + W_2 k)$ là một hàm phi tuyến của một cặp vector, không viết được thành một tích ma trận duy nhất; do đó ma trận $n \times m$ của mọi cặp điểm tương hợp không tính được bằng một phép nhân ma trận hiệu quả.

Đề xuất của bài báo: tính đồng thời mọi điểm tương hợp giữa các vị trí, chuẩn hóa chúng thành các phân phối xác suất, rồi dùng các phân phối đó để lấy trung bình có trọng số dữ liệu. Đó là attention. Phần còn lại của bài báo nhằm làm cho ý tưởng này đủ sâu, đủ song song và đủ ổn định khi huấn luyện để thay thế toàn bộ kiến trúc cũ.

## Cơ chế attention, phân tích từng thành phần

```definition[Attention tích vô hướng có tỉ lệ]
Cho $Q \in \mathbb{R}^{n \times d_k}$ là ma trận của $n$ truy vấn (query), $K \in \mathbb{R}^{m \times d_k}$ là ma trận của $m$ khóa (key), và $V \in \mathbb{R}^{m \times d_v}$ là ma trận của $m$ giá trị (value). Attention tích vô hướng có tỉ lệ (scaled dot-product attention) được định nghĩa là
$$\operatorname{Attention}(Q, K, V) = \operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V, \qquad (1)$$
trong đó $\operatorname{softmax}$ được áp dụng theo từng hàng: với một vector hàng $z \in \mathbb{R}^m$,
$$\operatorname{softmax}(z)_j = \frac{e^{z_j}}{\sum_{l=1}^{m} e^{z_l}}.$$
```

Công thức (1) là công thức (1) của bài báo và là toàn bộ cơ chế. Ta phân tích từng thành phần.

**Dạng song tuyến tính.** Tích $QK^\top$ là ma trận $n \times m$ của các tích vô hướng từng cặp: $(QK^\top)_{ij} = q_i \cdot k_j$, trong đó $q_i$ là hàng thứ $i$ của $Q$ và $k_j$ là hàng thứ $j$ của $K$. Đây là một hàm tương hợp *song tuyến tính* — dạng song tuyến tính $q^\top k$ — được tính tại mọi cặp. Nó thay thế cho attention cộng ở trên vì toàn bộ ma trận điểm số là một phép nhân ma trận duy nhất. Các hàng của $QK^\top$ là các *logit*: điểm số chưa chuẩn hóa, đo mức độ khớp giữa truy vấn $i$ và khóa $j$.

**Hàm softmax.** Áp dụng theo từng hàng, softmax biến hàng logit thứ $i$ thành một phân phối rời rạc $p_i \in \Delta^{m-1}$ trên $m$ vị trí:

$$
p_{ij} = \frac{e^{q_i \cdot k_j / \sqrt{d_k}}}{\sum_{l} e^{q_i \cdot k_l / \sqrt{d_k}}}.
$$

Như vậy mỗi vị trí đầu ra mang một phân phối xác suất đầy đủ trên các vị trí đầu vào — phân phối thể hiện mức độ liên quan mà mô hình gán cho từng vị trí. Attention không chọn một vị trí duy nhất; nó phân bố xác suất trên các vị trí.

**Phép nhân với $V$.** Hàng đầu ra thứ $i$ là

$$
(\operatorname{Attention}(Q,K,V))_{i\cdot} = \sum_{j=1}^{m} p_{ij}\, V_{j\cdot},
$$

một trung bình có trọng số của các hàng giá trị. Vì các trọng số attention tạo thành một vector xác suất, đây là một **tổ hợp lồi** — một điểm thuộc bao lồi của các hàng giá trị. Ký hiệu ma trận attention ngẫu nhiên theo hàng là $A = \operatorname{softmax}(QK^\top/\sqrt{d_k})$, với $A \ge 0$ và $A \mathbf{1} = \mathbf{1}$; toàn bộ phép tính là ánh xạ tuyến tính

$$
O = A V.
$$

Mỗi hàng của $O$ là *kỳ vọng* của các hàng giá trị dưới phân phối rời rạc $p_i$: $O_{i\cdot} = \mathbb{E}_{j \sim p_i}[V_{j\cdot}]$. Ba cách đọc của đẳng thức này tương ứng với ba vai trò của attention trong kiến trúc. Cách đọc thứ hai dùng ước lượng Nadaraya–Watson [^3] và cách nhìn kernel của Tsai và cộng sự [^4].

```remark[Cách đọc 1 — bộ nhớ khả vi]
Bộ ba $(Q, K, V)$ là một bộ nhớ truy cập theo nội dung: truy vấn $q_i$ là tín hiệu dò, các khóa là địa chỉ, các giá trị là nội dung. Tra cứu chính xác sẽ đặt $p_i = e_{\arg\max_j q_i \cdot k_j}$ — một phép chọn cứng. Attention thay $\arg\max$ bằng một địa chỉ mềm: nó đọc một *phối trộn* của các giá trị, với trọng số tỉ lệ với độ tương tự. Ánh xạ từ $Q$ đến $O$ là trơn, do đó gradient truyền qua toàn bộ quá trình tra cứu, và cả nội dung lẫn cơ chế định địa chỉ đều học được. Đây là điều kiện để attention có thể dùng như một thành phần khả vi trong mạng sâu.
```

```remark[Cách đọc 2 — hồi quy kernel]
Attention là ước lượng Nadaraya–Watson của thống kê phi tham số. Cho dữ liệu $\{(k_j, v_j)\}_{j=1}^{m}$, ước lượng Nadaraya–Watson của hàm hồi quy $k \mapsto v$ tại điểm $q$ là
$$\hat{v}(q) = \frac{\sum_j K(q, k_j)\, v_j}{\sum_j K(q, k_j)}$$
với một kernel $K$. Với kernel mũ $K(q,k) = e^{q \cdot k / \sqrt{d_k}}$, các trọng số chuẩn hóa chính là các trọng số softmax $p_j$. Do đó attention là phép làm trơn kernel — hồi quy với kernel học được, phụ thuộc dữ liệu — được tính đồng thời tại $n$ điểm truy vấn, với băng thông cố định bởi $\sqrt{d_k}$. Tsai và cộng sự đã chỉ ra rằng attention chính là một phép làm trơn kernel và việc chọn kernel (Gauss, Laplace, tuyến tính) nội suy giữa các biến thể attention. Ta quay lại điểm này ở phần cuối, vì đây là chìa khóa để phá bỏ nút thắt bậc hai.
```

```remark[Cách đọc 3 — kỳ vọng và toán tử]
Trên trục chuỗi, attention là một *toán tử trung bình tuyến tính*: $A$ là ma trận ngẫu nhiên theo hàng, nên $V \mapsto AV$ là phép làm trơn tổ hợp lồi của chuỗi — nhưng với hệ số phụ thuộc vào $Q$ và $K$, tức là phụ thuộc vào dữ liệu. Khác với một bộ lọc làm trơn cố định, attention là một bộ lọc phụ thuộc dữ liệu, và "hình dạng" của bộ lọc được học. Vì mỗi hàng đầu ra là một kỳ vọng $\mathbb{E}_{j \sim p_i}[V_{j\cdot}]$, entropy của $p_i$ — xem bên dưới — đo lượng thông tin mà phép đọc thực sự sử dụng.
```

### Vì sao có hệ số $\sqrt{d_k}$? Bổ đề phương sai

Ghi chú chân trang của bài báo nêu lý do trong một câu: *giả sử các thành phần của $q$ và $k$ là các biến ngẫu nhiên độc lập với kỳ vọng $0$ và phương sai $1$; khi đó tích vô hướng của chúng có kỳ vọng $0$ và phương sai $d_k$.* Ta chứng minh khẳng định đó rồi suy ra hệ quả.

```lemma[Phương sai của tích vô hướng]
Cho $q, k \in \mathbb{R}^{d_k}$ là các vector ngẫu nhiên độc lập, có các thành phần độc lập cùng phân phối (i.i.d.) với kỳ vọng $0$ và phương sai $\sigma^2$. Khi đó
$$\mathbb{E}[q \cdot k] = 0, \qquad \operatorname{Var}(q \cdot k) = d_k\, \sigma^4.$$
Riêng với các thành phần có phương sai $1$, tích vô hướng có độ lệch chuẩn $\sqrt{d_k}$.
```

```proof
Do tính độc lập, $\mathbb{E}[q_i k_i] = \mathbb{E}[q_i]\mathbb{E}[k_i] = 0$, và các số hạng $q_i k_i$ độc lập với nhau, nên
$$\operatorname{Var}(q \cdot k) = \sum_{i=1}^{d_k} \operatorname{Var}(q_i k_i) = \sum_{i=1}^{d_k} \mathbb{E}[q_i^2 k_i^2] = \sum_{i=1}^{d_k} \mathbb{E}[q_i^2]\,\mathbb{E}[k_i^2] = d_k \sigma^4.$$
```

Các truy vấn và khóa trong bài báo là đầu ra của các phép chiếu tuyến tính kèm chuẩn hóa, nên các thành phần của chúng có thang độ xấp xỉ đơn vị. Bổ đề khẳng định các logit chưa tỉ lệ $q_i \cdot k_j$ có độ lệch chuẩn $\sqrt{d_k}$ — với $d_k = 64$ trong mô hình cơ sở. Điều gì xảy ra với các logit cỡ $\sqrt{d_k}$?

```proposition[Bão hòa khi không tỉ lệ]
Cố định số khóa $m$ và giả sử các thành phần của $q$ và của mỗi $k_j$ độc lập cùng phân phối với kỳ vọng $0$ và phương sai $1$. Đặt $z_j = q \cdot k_j$ là các logit chưa tỉ lệ. Khi $d_k \to \infty$,
$$\max_j z_j - \max_{j \neq j^*} z_j \;\xrightarrow{p}\; \infty$$
với $j^*$ là chỉ số đạt cực đại: khoảng cách giữa logit lớn nhất và lớn nhì có bậc $\sqrt{d_k}$ (khoảng cách giữa hai thống kê thứ tự lớn nhất của $m$ phân phối chuẩn tắc là $\Theta(1)$, nên khoảng cách này tăng theo độ lệch chuẩn $\sqrt{d_k}$). Do đó $\operatorname{softmax}(z)$ hội tụ theo xác suất về một vector one-hot, và đạo hàm của softmax triệt tiêu: gradient của mọi hàm mất mát truyền qua các trọng số attention tiến về không.
```

```proof
Theo định lý giới hạn trung tâm, mỗi $z_j$ xấp xỉ $\mathcal{N}(0, d_k)$, và các $z_j$ độc lập. Khoảng cách giữa hai giá trị lớn nhất của $m$ phân phối Gauss độc lập cùng phân phối với độ lệch chuẩn $\sqrt{d_k}$ bằng $\sqrt{d_k}$ nhân với khoảng cách giữa hai thống kê thứ tự lớn nhất của $m$ phân phối chuẩn tắc, đại lượng này là $\Theta(1)$ — tiệm cận phân phối mũ với kỳ vọng tiến tới $\sqrt{2\pi}$ — theo lý thuyết giá trị cực trị của thống kê thứ tự Gauss. Với $m$ cố định, khoảng cách này phân kỳ khi $d_k \to \infty$. Softmax của một vector có khoảng cách cực đại phân kỳ sẽ tập trung: thành phần lớn nhất $p_{j^*} \to 1$ theo xác suất, các thành phần khác $\to 0$. Cuối cùng, ma trận Jacobi của softmax có các phần tử $p_i(\delta_{ij} - p_j)$, triệt tiêu khi $p$ suy biến thành vector one-hot — gradient bị triệt tiêu.
```

Hệ số tỉ lệ $1/\sqrt{d_k}$ do đó là một *chuẩn hóa nhiệt độ*: $\operatorname{softmax}(z / \sqrt{d_k})$ giữ thang độ hiệu dụng của logit ở mức $O(1)$ bất kể $d_k$ lớn đến đâu, nhờ đó softmax hoạt động trong vùng mà đạo hàm của nó đáng kể và gradient truyền được. Đây chính là điều bài báo khẳng định bằng lời: *"chúng tôi nghi ngờ rằng với $d_k$ lớn, các tích vô hướng tăng về độ lớn, đẩy hàm softmax vào vùng có gradient rất nhỏ."* Hệ số tỉ lệ không phải là chi tiết kỹ thuật; nó là điều kiện để attention huấn luyện được.

```remark[Thông tin Fisher chính là ma trận Jacobi của softmax]
Có một cách nhìn theo lý thuyết thông tin cho cùng hiện tượng. Softmax là hàm liên kết chính tắc của họ mũ rời rạc (categorical), và ma trận Jacobi của ánh xạ $z \mapsto p(z)$ là
$$\frac{\partial p_i}{\partial z_j} = p_i(\delta_{ij} - p_j) = \left(\operatorname{diag}(p) - pp^\top\right)_{ij},$$
chính là **ma trận thông tin Fisher** của phân phối rời rạc với xác suất $p$. Khi $p$ tiến về một đỉnh của đơn hình — khi attention bão hòa — thông tin Fisher suy biến (mô hình đa thức tiến về biên của họ), và gradient triệt tiêu. "Gradient rất nhỏ" và "thông tin Fisher suy biến" là cùng một phát biểu trong hai ngôn ngữ. Hệ số $\sqrt{d_k}$ giữ các phân phối attention ở phần *trong* của đơn hình, nơi hình học của họ không suy biến.
```

```remark[Entropy như một chỉ số chẩn đoán]
Entropy $H(p_i) = -\sum_j p_{ij} \log p_{ij}$ của một hàng attention đo mức độ phân tán thông tin của phép đọc: $H = \log m$ ứng với attention đều (attention vào mọi thứ, không học được gì về mức độ liên quan); $H = 0$ ứng với phép chọn một vị trí duy nhất (một lần tra cứu chắc chắn). Huấn luyện làm cho attention sắc nét dần từ khởi tạo gần như đều về các phân phối có cấu trúc, entropy thấp — mô hình đang học một bộ nhớ. Quan sát entropy theo đầu và theo tầng là một trong những công cụ chẩn đoán quan trọng nhất của việc giải thích mô hình transformer hiện đại; dạng hỏng hóc của nó — *sụp đổ entropy* — được bàn ở phần cuối.
```

## Attention đa đầu: tổ hợp các phép làm trơn

Một phân phối attention duy nhất chỉ cho một "khía cạnh" của đầu vào — một cách đánh trọng số vị trí. Công thức thứ hai của bài báo nhân số khía cạnh lên:

```definition[Attention đa đầu]
$$\operatorname{MultiHead}(Q,K,V) = \operatorname{Concat}(\mathrm{head}_1, \dots, \mathrm{head}_h)\, W^O, \qquad (2)$$
trong đó
$$\mathrm{head}_i = \operatorname{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$
với các ma trận tham số $W_i^Q, W_i^K \in \mathbb{R}^{d_{\text{model}} \times d_k}$, $W_i^V \in \mathbb{R}^{d_{\text{model}} \times d_v}$ và $W^O \in \mathbb{R}^{h d_v \times d_{\text{model}}}$. Trong mô hình cơ sở, $h = 8$, $d_k = d_v = 64$, $d_{\text{model}} = 512$, nên $d_k = d_v = d_{\text{model}} / h$.
```

Mỗi đầu là một phép làm trơn kernel trên một *không gian con $d_k$ chiều* của không gian đặc trưng: phép chiếu $W_i^Q$ (tương ứng $W_i^K$) chọn $d_k$ tọa độ nào của mỗi truy vấn (tương ứng khóa) tham gia vào điểm tương hợp. Ma trận attention của đầu $i$ là

$$
A_i = \operatorname{softmax}\!\left(\frac{QW_i^Q\, (KW_i^K)^\top}{\sqrt{d_k}}\right),
$$

ma trận Gram của các truy vấn và khóa sau khi chiếu. Viết $W^O$ theo khối $W^O = [W_1^O \cdots W_h^O]$, đầu ra là

$$
\operatorname{MultiHead}(Q,K,V) = \sum_{i=1}^{h} \left(A_i\, V W_i^V\right) W_i^O,
$$

một tổng theo đầu của (phép làm trơn kernel ngẫu nhiên theo hàng $\circ$ ánh xạ tuyến tính). Attention đa đầu là một **tổ hợp của $h$ phép làm trơn kernel**, mỗi phép có không gian con và phân phối attention học được riêng, được tái tổ hợp bằng một ánh xạ tuyến tính cuối cùng.

```proposition[Attention đa đầu không tốn thêm chi phí]
Attention đa đầu với $h$ đầu và $d_k = d_v = d_{\text{model}}/h$ dùng cùng số tham số và cùng độ phức tạp tiệm cận như attention một đầu với chiều đầy đủ $d_{\text{model}}$.
```

```proof
Mỗi đầu có các ma trận chiếu với tổng kích thước $3 \cdot d_{\text{model}} \cdot d_k = 3 d_{\text{model}}^2 / h$; trên $h$ đầu là $3 d_{\text{model}}^2$. Ma trận đầu ra $W^O \in \mathbb{R}^{h d_v \times d_{\text{model}}}$ đóng góp $h d_v d_{\text{model}} = d_{\text{model}}^2$. Tổng cộng: $4 d_{\text{model}}^2$ — bằng đúng attention một đầu với $d_k = d_v = d_{\text{model}}$. Về tính toán, mỗi đầu tính một ma trận điểm số kích thước $n \times m$ với chi phí $n m d_k$; trên tất cả các đầu, $h \cdot n m d_k = n m d_{\text{model}}$, cùng chi phí với một đầu chiều đầy đủ. Lợi ích của việc tách đầu hoàn toàn nằm ở mặt biểu diễn: thay vì một dạng song tuyến tính hạng $d_{\text{model}}$, mô hình học $h$ dạng song tuyến tính hạng $d_k$ chạy song song.
```

Việc dùng $h$ tương tác hạng thấp thay vì một tương tác hạng đầy đủ mang lại lợi ích sau: một phân phối softmax duy nhất chỉ cho một cách đánh trọng số vị trí, trong khi $h$ phân phối độc lập cho phép mô hình attention theo các khía cạnh khác nhau đồng thời. Phân tích các đầu đã huấn luyện trong bài báo cho thấy các đầu chuyên hóa vào các quan hệ phân biệt được: các vị trí liền kề trong đầu ra (các đầu "vị trí"), các quan hệ phụ thuộc cú pháp, và sự đồng tham chiếu (một đại từ attention về tiền ngữ của nó ở vài vị trí trước). Mỗi đầu là một kernel học được khác nhau trên một không gian con khác nhau, và phép tái tổ hợp tuyến tính $W^O$ quyết định cách các khía cạnh kết hợp.

```remark
Hệ số tỉ lệ trong công thức (1) dùng chiều *của từng đầu* $d_k = 64$, không phải $d_{\text{model}} = 512$ — phù hợp với bổ đề phương sai: các tích vô hướng của mỗi đầu sống trong $\mathbb{R}^{d_k}$, và chính $d_k$ phải được chuẩn hóa. Một lỗi cài đặt phổ biến là chia cho $\sqrt{d_{\text{model}}}$; bổ đề giải thích vì sao cách đó sai: nó làm chuẩn hóa quá mức các logit của mỗi đầu với hệ số $\sqrt{8}$, làm phân phối attention dẹt về phía đều.
```

## Self-attention: toán tử kết nối mọi cặp

Trong bộ mã hóa, cả ba ma trận đều suy ra từ cùng một chuỗi qua các phép chiếu học được:

$$
Q = XW_Q, \qquad K = XW_K, \qquad V = XW_V, \qquad X \in \mathbb{R}^{n \times d_{\text{model}}}.
$$

Self-attention khi đó là ánh xạ $X \mapsto \operatorname{softmax}(XW_Q W_K^\top X^\top / \sqrt{d_k}) X W_V$ từ biểu diễn của một chuỗi sang biểu diễn mới của cùng chuỗi đó. Hai tính chất cấu trúc của ánh xạ này tổ chức toàn bộ phần còn lại.

```theorem[Đẳng biến dưới phép hoán vị]
Cho $\pi$ là một phép hoán vị của $n$ vị trí, tác động lên một ma trận bằng cách hoán vị các hàng. Self-attention đẳng biến: với mọi $Q, K, V$,
$$\operatorname{Attention}(\pi Q, \pi K, \pi V) = \pi\, \operatorname{Attention}(Q, K, V).$$
```

```proof
Vì $\pi$ tác động bằng cách hoán vị hàng, $(\pi Q)(\pi K)^\top = \pi (QK^\top) \pi^\top$. Với mọi ma trận $M$, softmax theo hàng của $\pi M \pi^\top$ có các phần tử $(\operatorname{softmax}(\pi M \pi^\top))_{ij} = \operatorname{softmax}(M)_{\pi^{-1}(i), \pi^{-1}(j)}$, bởi vì hàng $i$ của ma trận đã hoán vị là hàng $\pi^{-1}(i)$ của $M$ với các cột được hoán vị bởi $\pi^{-1}$, và softmax của một vector đã hoán vị là softmax đã hoán vị. Do đó $A' = \pi A \pi^\top$, và
$$A' (\pi V) = \pi A \pi^\top \pi V = \pi (A V).$$
```

```corollary[Vị trí phải được tiêm vào]
Self-attention thuần túy coi chuỗi như một *tập hợp*: nó không phân biệt được thứ tự. Mọi thông tin về thứ tự trong mô hình phải được tiêm vào một cách tách biệt — đây chính là lý do bài báo thêm mã hóa vị trí (phần "Mã hóa vị trí: thời gian như một xuyến"). Nói cách khác, attention đơn lẻ đẳng biến dưới phép hoán vị, nên kiến trúc phải tự phá bỏ tính đẳng biến đó.
```

Ma trận attention $A = \operatorname{softmax}(QK^\top/\sqrt{d_k})$ còn có một cách đọc khác: nó là một **ma trận ngẫu nhiên theo hàng**, ma trận chuyển tiếp của một chuỗi Markov trên $n$ vị trí. Self-attention tính một bước truyền thông điệp dọc theo một *đồ thị có hướng đầy đủ* mà trọng số cạnh $A_{ij}$ là các xác suất chuyển tiếp học được, phụ thuộc dữ liệu: mỗi nút gom các giá trị của các nút lân cận với trọng số $A_{ij}$. Xếp chồng các tầng sẽ hợp thành các toán tử ngẫu nhiên này (đan xen với các ánh xạ phi tuyến theo điểm), nên transformer sâu khuếch tán thông tin qua chuỗi một cách lặp lại. Cách đọc Markov này trở nên có giá trị dự đoán ở phần cuối, nơi các dạng hỏng hóc quan sát được của attention sâu đúng là các hiện tượng của chuỗi Markov — hội tụ về trạng thái hấp thụ.

### Attention có mặt nạ: tính nhân quả như một phân phối bị cắt cụt

Self-attention của bộ giải mã phải *nhân quả*: dự đoán tại vị trí $i$ chỉ được phụ thuộc vào các vị trí $j \le i$. Bài báo cài đặt điều này bằng một mặt nạ cộng vào các logit: một ma trận $M$ với

$$
M_{ij} = \begin{cases} 0 & j \le i, \\ -\infty & j > i, \end{cases}
$$

nên

$$
\operatorname{softmax}(z + M)_j = \begin{cases} \dfrac{e^{z_j}}{\sum_{l \le i} e^{z_l}} & j \le i, \\[1em] 0 & j > i, \end{cases}
$$

một **phân phối rời rạc bị cắt cụt** — softmax của các logit hạn chế trên tiền tố $\{1, \dots, i\}$. Ma trận attention có mặt nạ là tam giác dưới và ngẫu nhiên theo hàng, giá của mỗi hàng là một tiền tố của các vị trí. Một thiết bị duy nhất này dung hòa hai yêu cầu tưởng như mâu thuẫn: mô hình phải được huấn luyện trên tất cả các vị trí *song song* (teacher forcing, trong đó các đầu ra đúng của các vị trí trước được đưa vào), và phải sinh *tự hồi quy* khi suy luận (mỗi token chỉ điều kiện hóa trên các token trước nó). Mặt nạ làm cả hai điều cùng đúng. Attention chéo trong bộ giải mã — với $Q$ từ bộ giải mã và $K, V$ từ bộ mã hóa — không mang mặt nạ: mọi vị trí của bộ giải mã được phép attention vào mọi vị trí của bộ mã hóa.

### Bảng độ phức tạp

Bảng 1 của bài báo là luận cứ định lượng cho attention. Với một tầng xử lý $n$ vị trí chiều $d$, độ rộng kernel tích chập $k$ và cửa sổ attention $r$:

- **Self-attention:** độ phức tạp $O(n^2 d)$, số phép toán tuần tự $O(1)$, độ dài đường truyền tối đa $O(1)$.
- **Truy hồi:** độ phức tạp $O(n d^2)$, số phép toán tuần tự $O(n)$, độ dài đường truyền tối đa $O(n)$.
- **Tích chập:** độ phức tạp $O(k n d^2)$, số phép toán tuần tự $O(1)$, độ dài đường truyền tối đa $O(\log_k n)$.
- **Attention hạn chế** (cửa sổ $r$): độ phức tạp $O(r n d)$, số phép toán tuần tự $O(1)$, độ dài đường truyền tối đa $O(n/r)$.

*Độ dài đường truyền tối đa* là đại lượng toán học đo sự phụ thuộc xa: số phép toán mà một tín hiệu phải đi qua để di chuyển giữa hai vị trí xa nhau. Truy hồi có độ dài đường truyền $O(n)$ — vị trí $1$ đến được vị trí $n$ chỉ qua chuỗi trạng thái ẩn. Tích chập tăng trường tiếp nhận với hệ số $k$ sau mỗi tầng, nên độ dài đường truyền là $O(\log_k n)$ — tốt hơn, nhưng vẫn logarit. Self-attention nối *trực tiếp mọi cặp vị trí*: độ dài đường truyền $O(1)$ trong một tầng duy nhất. Thông tin không cần di chuyển; nó đã ở khắp nơi.

Số hạng bậc hai $O(n^2 d)$ là giá phải trả cho tính kết nối mọi cặp. Sự bảo vệ của bài báo nằm ở chế độ làm việc: trong dịch máy, $n$ là độ dài câu (vài chục token) và $d = 512$, nên $n^2 d < n d^2$ — attention còn *rẻ hơn* truy hồi đúng trong chế độ quan trọng. (Biến thể attention hạn chế, từ Image Transformer, nội suy: cửa sổ $r$ đánh đổi độ dài đường truyền lấy chi phí $O(r n d)$.) Hai trong ba hạn chế của truy hồi bị loại bỏ trực tiếp — tính song song và độ dài đường truyền — còn hạn chế thứ ba, độ phức tạp, trở thành một câu hỏi về chế độ làm việc.

## Mã hóa vị trí: thời gian như một xuyến

Tính đẳng biến hoán vị vừa là tính chất vừa là trở ngại: nó bảo đảm thứ tự không lọt vào một cách ngẫu nhiên, nhưng thứ tự phải đi vào bằng cách nào đó. Giải pháp của bài báo là công thức (4):

```definition[Mã hóa vị trí hình sin]
Với vị trí $\mathrm{pos} \ge 0$ và chỉ số chiều $i = 0, \dots, d_{\text{model}}/2 - 1$,
$$\mathrm{PE}_{(\mathrm{pos}, 2i)} = \sin\!\left(\frac{\mathrm{pos}}{10000^{2i/d_{\text{model}}}}\right), \qquad \mathrm{PE}_{(\mathrm{pos}, 2i+1)} = \cos\!\left(\frac{\mathrm{pos}}{10000^{2i/d_{\text{model}}}}\right). \qquad (4)$$
```

Đặt $\omega_i = 10000^{-2i/d_{\text{model}}}$. Các tần số $\omega_i$ tạo thành một **cấp số nhân** từ $1$ xuống $10000^{-1}$ khi $i$ chạy từ $0$ đến $d_{\text{model}}/2 - 1$: một chồng các dao động tử ở các tần số cách đều theo thang nhân. Mã hóa của vị trí $\mathrm{pos}$ là vector

$$
\mathrm{PE}(\mathrm{pos}) = \big(\sin(\omega_0 \mathrm{pos}), \cos(\omega_0 \mathrm{pos}), \dots, \sin(\omega_{d/2-1} \mathrm{pos}), \cos(\omega_{d/2-1} \mathrm{pos})\big)^\top,
$$

một điểm trên **xuyến** $(S^1)^{d/2}$: mỗi cặp tọa độ $(2i, 2i+1)$ là một điểm trên đường tròn đơn vị ở pha $\omega_i \mathrm{pos}$. Ánh xạ $\mathrm{pos} \mapsto \mathrm{PE}(\mathrm{pos})$ là một dòng chảy tuyến tính trên xuyến với vector tần số $(\omega_0, \dots, \omega_{d/2-1})$, và toàn bộ mã hóa bị chặn: mọi phần tử nằm trong $[-1, 1]$.

Lý do bài báo chọn mã hóa này thay vì các phép nhúng học được là một sự kiện đại số tuyến tính:

```theorem[Dịch chuyển vị trí = phép quay]
Cho $\mathrm{PE}(\mathrm{pos}) \in \mathbb{R}^d$ là mã hóa hình sin ở trên. Với mọi số nguyên $k$,
$$\mathrm{PE}(\mathrm{pos} + k) = R_k\, \mathrm{PE}(\mathrm{pos}),$$
trong đó $R_k$ là ma trận trực giao chéo khối với các khối $2 \times 2$ là các phép quay
$$R(\omega_i k) = \begin{pmatrix} \cos(\omega_i k) & \sin(\omega_i k) \\ -\sin(\omega_i k) & \cos(\omega_i k) \end{pmatrix}.$$
```

```proof
Cặp tọa độ của $\mathrm{PE}(\mathrm{pos})$ là $(\sin \phi, \cos \phi)$ với $\phi = \omega_i \mathrm{pos}$. Theo các công thức cộng,
$$\sin(\phi + \theta) = \sin\phi\cos\theta + \cos\phi\sin\theta, \qquad \cos(\phi + \theta) = \cos\phi\cos\theta - \sin\phi\sin\theta,$$
đúng là tác động của ma trận quay $R(\theta)$ lên $(\sin\phi, \cos\phi)$ với $\theta = \omega_i k$. Ghép các khối theo $i$ được $R_k$; ma trận này trực giao (chéo khối của các phép quay) và không phụ thuộc vào $\mathrm{pos}$.
```

Hệ quả là khẳng định của bài báo, giờ đã chính xác: *"mô hình có thể dễ dàng học cách attention theo vị trí tương đối."* Một độ dịch chuyển tương đối không phải là một hàm phi tuyến phức tạp của mã hóa — nó là một **ánh xạ tuyến tính** (một phép quay) tác động lên mã hóa. Bất kỳ cơ chế tuyến tính nào mạng dùng để kết hợp các vị trí đều có thể biểu diễn "vị trí $j$ cách vị trí $i$ một khoảng $k$" bằng một ma trận học được duy nhất tác động lên các mã hóa. Sự kiện tương tự còn có một hệ quả thứ hai, tinh tế hơn:

```corollary[Kernel vị trí bất biến tịnh tiến]
Tích vô hướng của hai mã hóa vị trí chỉ phụ thuộc vào khoảng cách *tương đối*:
$$\mathrm{PE}(p)^\top \mathrm{PE}(q) = \sum_{i} \cos(\omega_i (p - q)).$$
```

```proof
Khai triển $\sin\omega_i p \sin\omega_i q + \cos\omega_i p \cos\omega_i q = \cos(\omega_i(p-q))$ theo công thức hiệu của cosin, rồi cộng theo $i$.
```

Mã hóa vị trí do đó là một *ánh xạ đặc trưng cho một kernel bất biến tịnh tiến (dừng) trên các vị trí* — họ hàng tất định của các đặc trưng Fourier ngẫu nhiên của Rahimi và Recht, vốn xấp xỉ các kernel bất biến tịnh tiến bằng các ánh xạ đặc trưng lượng giác nhờ định lý Bochner [^5]. Attention giữa hai vị trí $p$ và $q$ xây trên các đặc trưng này nhìn thấy một độ tương tự chỉ phụ thuộc vào $p - q$ — đúng là tiên nghiệm mà các mã hóa vị trí tương đối sau này làm tường minh bằng cách tham số hóa trực tiếp các điểm số attention theo độ lệch $j - i$ [^6].

Hai chi tiết thiết kế nữa đáng được bình luận toán học. Thứ nhất, lịch tần số *nhân* là một phân rã đa tỉ lệ: các tọa độ tần số thấp ($\omega_i$ gần $1$) biến thiên chậm và mã hóa vị trí thô, còn các tọa độ tần số cao phân giải các độ lệch nhỏ — một phân rã kiểu Fourier/wavelet của "tín hiệu vị trí", cho mã hóa cả độ phân giải xa và gần. Thứ hai, bài báo nhân các phép nhúng token học được với $\sqrt{d_{\text{model}}}$ trước khi cộng mã hóa: các phép nhúng học được có các phần tử ở thang đơn vị, nên chuẩn của chúng xấp xỉ $\sqrt{d_{\text{model}}}$, trong khi mã hóa bị chặn từng phần tử bởi $1$; phép nhân đưa hai đóng góp về cùng thang độ để không thành phần nào lấn át thành phần kia trong tổng.

## Mạng truyền thẳng: tính phi tuyến trên trục đặc trưng

```definition[Mạng truyền thẳng theo từng vị trí]
$$\mathrm{FFN}(x) = \max(0,\, xW_1 + b_1)\, W_2 + b_2, \qquad (3)$$
với $W_1 \in \mathbb{R}^{d_{\text{model}} \times 4 d_{\text{model}}}$, $W_2 \in \mathbb{R}^{4 d_{\text{model}} \times d_{\text{model}}}$, và cùng một bộ trọng số áp dụng độc lập tại mỗi vị trí.
```

Công thức (3) là công thức (3) của bài báo: một perceptron hai tầng với tầng ẩn rộng $4 d_{\text{model}}$ và hàm phi tuyến ReLU $\max(0, \cdot)$. Vai trò toán học của nó trong khối là chính xác và bổ sung cho vai trò của attention:

- **Attention trộn theo vị trí** — nó là một toán tử tuyến tính trên trục chuỗi (một ma trận ngẫu nhiên theo hàng tác động lên $V$), để cấu trúc đặc trưng của mỗi hàng gần như nguyên vẹn.
- **FFN trộn theo đặc trưng** — nó là một ánh xạ phi tuyến trên trục đặc trưng, áp dụng giống nhau tại mọi vị trí (một tích chập $1 \times 1$, theo ngôn ngữ tích chập).

Khối transformer luân phiên hai hướng trộn: một tầng con attention trao đổi thông tin *ngang* (giữa các vị trí), rồi một FFN biến đổi nó *dọc* (giữa các đặc trưng). Sự tách biệt này làm cho kiến trúc vừa song song (attention là một chuỗi phép toán ma trận cố định, không phụ thuộc thứ tự) vừa có năng lực biểu diễn (FFN đưa vào tính phi tuyến mà attention thiếu — attention tuyến tính trong $V$ với hệ số phụ thuộc dữ liệu, và một chồng ánh xạ tuyến tính không có phi tuyến theo điểm sẽ sụp thành một ánh xạ tuyến tính duy nhất).

ReLU đáng được nhìn kỹ hơn: nó tuyến tính từng khúc, và kích hoạt ẩn

$$
h = \max(0, xW_1 + b_1)
$$

là *thưa* — tỉ lệ đơn vị hoạt động phụ thuộc vào đầu vào. Viết $D(x) = \operatorname{diag}(\mathbf{1}_{\{xW_1 + b_1 > 0\}})$, FFN hoạt động như một cổng phụ thuộc dữ liệu:

$$
\mathrm{FFN}(x) = W_2\, D(x)\,(xW_1 + b_1) + b_2,
$$

một ánh xạ tuyến tính học được có ma trận trọng số hiệu dụng được bật/tắt theo dữ liệu. Hệ số rộng $4$ mở rộng biểu diễn vào một không gian đặc trưng chiều cao hơn trước khi chiếu ngược — cùng mẫu mở rộng–co lại như một phép nhúng kiểu kernel — và là nơi mô hình lưu phần lớn tham số (hai ma trận FFN mỗi khối nhiều gấp đôi các ma trận attention). Cách đọc bộ nhớ cũng có cơ sở: các hàng của $W_1$ đóng vai trò khóa và các cột của $W_2$ đóng vai trò giá trị, biến mỗi FFN thành một bộ nhớ khóa–giá trị theo đúng nghĩa [^12]. Attention là bộ nhớ *trộn vị trí*; FFN là bộ nhớ *trộn đặc trưng*.

## Kết nối dư và LayerNorm: đại số của quá trình huấn luyện

Mọi tầng con trong bài báo được bọc dưới dạng

$$
\operatorname{LayerNorm}\!\big(x + \operatorname{Sublayer}(x)\big),
$$

cấu hình **post-norm**: kết nối dư cộng đầu vào vào đầu ra của tầng con, rồi LayerNorm chuẩn hóa tổng. Hai mảnh toán học làm cho cách bọc này đúng đắn.

**Kết nối dư.** Viết $h = x + f(x)$, ánh xạ là một nhiễu động của ánh xạ đồng nhất, và đạo hàm của nó là

$$
\frac{\partial h}{\partial x} = I + \frac{\partial f}{\partial x}.
$$

Lan truyền ngược qua $L$ tầng nhân các ma trận Jacobi $\prod_{t} (I + J_t)$. Số hạng đồng nhất là quan trọng: gradient có thể *bỏ qua* mọi phi tuyến và chảy ngược dọc theo đường đồng nhất, nên tích không co về không theo cấp số nhân theo độ sâu như một chuỗi $\prod_t J_t$ các ma trận Jacobi điển hình. Khai triển tương đương,

$$
x_L = x_0 + \sum_{t=1}^{L} f_t(x_{t-1}),
$$

biểu diễn cuối cùng là một *tổng tích lũy các hiệu chỉnh*: mỗi tầng thêm một sự tinh chỉnh vào một luồng không bao giờ bị loại bỏ. Đây là cách nhìn **luồng dư (residual stream)**, và nó có cách đọc theo hệ động lực: $x_{t+1} - x_t = f_t(x_t)$ là một bước Euler cho phương trình vi phân thường

$$
\frac{dx}{ds} = F(x),
$$

nên một mạng dư sâu là một rời rạc hóa của một dòng chảy liên tục trên không gian các biểu diễn token — độ sâu là thời gian tích phân, và "đi sâu hơn" là tích phân lâu hơn. (Biến thể pre-norm hiện đại, áp LayerNorm vào đầu ra tầng con *trước khi* cộng dư, làm cho luồng dư đúng nghĩa không bị chuẩn hóa — một chi tiết chỉ làm sắc nét thêm bức tranh này, và là lý do pre-norm trở thành chuẩn cho các transformer rất sâu.)

**LayerNorm.** Cho vector đặc trưng $x \in \mathbb{R}^d$ của một token, LayerNorm tính kỳ vọng $\mu = \frac{1}{d}\sum_i x_i$ và phương sai $\sigma^2 = \frac{1}{d}\sum_i (x_i - \mu)^2$ trên trục đặc trưng, rồi áp dụng

$$
\operatorname{LN}(x) = \gamma \odot \frac{x - \mu}{\sqrt{\sigma^2 + \varepsilon}} + \beta,
$$

với tỉ lệ học được $\gamma \in \mathbb{R}^d$ và độ dịch học được $\beta \in \mathbb{R}^d$ [^13]. Tính chất xác định của nó là một bổ đề nhỏ:

```lemma[Bất biến của LayerNorm]
Với mọi $c > 0$ và mọi $b \in \mathbb{R}$, $\operatorname{LN}(cx + b\mathbf{1}) = \operatorname{LN}(x)$: LayerNorm bất biến đối với phép co giãn và phép cộng hằng số của đầu vào.
```

```proof
Vector chuẩn hóa $(x - \mu)/\sqrt{\sigma^2}$ bất biến: trừ $b\mathbf{1}$ triệt tiêu trong $x - \mu$, và co giãn nhân cả tử số và mẫu số với $c$. Các tham số học được $\gamma, \beta$ sau đó đưa lại tỉ lệ và độ dịch như các tham số tự do.
```

Tính bất biến này là nội dung toán học của phát biểu "chuẩn hóa làm ổn định huấn luyện": các biểu diễn trung gian trong một mạng sâu trôi dạt về độ lớn, và nếu không chuẩn hóa, các tầng sau chịu sự trôi dạt đó. LayerNorm loại bỏ cả tỉ lệ lẫn kỳ vọng của biểu diễn mỗi token, nên phép tính hiệu dụng của mạng bất biến đối với độ lớn của các kích hoạt trung gian — sự trôi dạt bị chuẩn hóa đi tại mỗi bước. Nó được áp dụng *theo từng token* (trên trục đặc trưng), nên độc lập với thống kê của batch và dùng được trong giải mã tự hồi quy, không như BatchNorm. (Chuẩn hóa cũng có một cách đọc hình học: $(x - \mu)/\sigma$ là phép chiếu của $x$ lên mặt cầu bán kính $\sqrt{d}$ trong siêu phẳng trực giao với $\mathbf{1}$ — các biểu diễn sống trên một mặt cầu, một cấu trúc mà các phân tích gần đây về hình học của transformer khai thác trực tiếp.)

Phần còn lại của công thức huấn luyện trong bài báo là phần đại số còn lại: dropout với tỉ lệ $0{,}1$ áp dụng vào đầu ra của mỗi tầng con trước khi cộng dư, và vào tổng của phép nhúng và mã hóa vị trí. Kết nối dư, chuẩn hóa và dropout cùng nhau là điều kiện để các chồng attention sâu huấn luyện được. (Dropout trên chính các trọng số attention — loại bỏ các phần tử của ma trận ngẫu nhiên $A$ — là một bổ sung chuẩn về sau, không có trong bài báo gốc.)

## Vì sao "attention is all you need": kiến trúc

Mô hình đầy đủ lắp ráp các thành phần. **Bộ mã hóa** gồm $N = 6$ khối giống nhau, mỗi khối gồm một tầng con self-attention đa đầu và một tầng con FFN, mỗi tầng con được bọc Add & Norm. **Bộ giải mã** gồm $N = 6$ khối, mỗi khối có một tầng con self-attention đa đầu *có mặt nạ* (tính nhân quả), một tầng con *attention chéo* đa đầu trong đó các truy vấn đến từ bộ giải mã còn các khóa và giá trị từ đầu ra của bộ mã hóa (điều kiện hóa theo nguồn), và một tầng con FFN. Bộ giải mã kết thúc bằng một ánh xạ tuyến tính học được và một softmax trên từ vựng. Các phép nhúng token được dùng chung giữa bộ mã hóa, bộ giải mã và phép chiếu trước softmax (weight tying), và các mã hóa vị trí được cộng vào các phép nhúng ở đáy của cả hai chồng.

Mọi thành phần mà các kiến trúc trước dùng cho mô hình hóa chuỗi đã bị thay thế: truy hồi bởi self-attention (mặt nạ nhân quả xử lý thứ tự), attention mã hóa–giải mã bởi attention chéo, và phép tính tuần tự từng vị trí bởi FFN. Luận điểm của bài báo mang tính kiến trúc: ba phép toán mà một mô hình chuyển đổi chuỗi cần — trộn thông tin giữa các vị trí, biến đổi đặc trưng, và điều kiện hóa đầu ra theo đầu vào — đều được cài đặt bằng attention, ánh xạ truyền thẳng và bộ bọc dư/chuẩn hóa, *không* dùng truy hồi và *không* dùng tích chập. Kết quả thực nghiệm: mô hình lớn đạt 28,4 BLEU trên dịch Anh–Đức (hơn kết quả tốt nhất trước đó 2 BLEU) và 41,8 trên Anh–Pháp, huấn luyện trong 3,5 ngày trên 8 GPU — trong khi các mô hình truy hồi cần nhiều tuần. Tính song song và đường truyền ngắn không chỉ là lý thuyết; chúng là thời gian thực tế.

## Huấn luyện, dưới góc độ toán học

Phần huấn luyện của bài báo cũng toán học như phần kiến trúc, và ba lựa chọn đáng được phân tích ở mức công thức.

**Làm trơn nhãn.** Hàm mục tiêu là cross-entropy so với nhãn one-hot $y$: $L = -\sum_j y_j \log p_j = -\log p_{\text{đúng}}$. Làm trơn nhãn thay nhãn bằng một phối trộn của phân phối one-hot và phân phối đều trên từ vựng kích thước $K$:

$$
y' = (1 - \varepsilon) y + \frac{\varepsilon}{K}\mathbf{1}, \qquad \varepsilon = 0{,}1.
$$

Hàm mất mát trở thành

$$
L = -\sum_j y'_j \log p_j = (1-\varepsilon)(-\log p_c) - \frac{\varepsilon}{K}\sum_{j} \log p_j,
$$

trong đó số hạng thứ hai đạt cực tiểu khi $p$ đều — đó là một phạt đối với sự quá tự tin, một bộ chính quy hóa kéo phân phối dự đoán ra khỏi đỉnh của đơn hình. (Tương đương, $- \frac{1}{K}\sum_j \log p_j = \mathrm{KL}(u \,\|\, p) + H(u)$ với $u$ là phân phối đều: làm trơn thêm một số hạng phân kỳ về phía đều.) Báo cáo của bài báo rằng làm trơn nhãn "làm tăng perplexity, vì mô hình học cách kém chắc chắn hơn, nhưng cải thiện độ chính xác và BLEU" đúng như toán học dự đoán: mô hình kém chắc chắn hơn (perplexity tăng) và ít quá khớp hơn (độ chính xác tăng). Theo ngôn ngữ lý thuyết thông tin, làm trơn giới hạn năng lực của mô hình trong việc tập trung khối xác suất — nó giữ các phân phối dự đoán ở phần trong của đơn hình, cùng triết lý với hệ số tỉ lệ $\sqrt{d_k}$.

**Adam với giai đoạn warmup.** Bộ tối ưu là Adam với $\beta_1 = 0{,}9$, $\beta_2 = 0{,}98$, $\varepsilon = 10^{-9}$, và một tốc độ học biến thiên theo bước huấn luyện:

$$
\mathrm{lrate} = d_{\text{model}}^{-1/2} \cdot \min\!\left(\mathrm{step}^{-1/2},\; \mathrm{step} \cdot \mathrm{warmup}^{-3/2}\right), \qquad \mathrm{warmup} = 4000.
$$

Với $\mathrm{step} < 4000$ đây là một đường tăng tuyến tính từ không với hệ số góc $d_{\text{model}}^{-1/2}\,\mathrm{warmup}^{-3/2}$; với $\mathrm{step} \ge 4000$ nó giảm theo $\mathrm{step}^{-1/2}$. Warmup không phải là tiện nghi: ước lượng phương sai $\hat{v}_t$ của Adam là một trung bình trượt của các bình phương gradient, không đáng tin cậy khi mới thấy vài mẫu, và một bước lớn trong vài nghìn bước đầu làm mất ổn định ước lượng đó; đường tăng tuyến tính cho các thang thích ứng kịp ổn định trước chế độ giảm. Hệ số $d_{\text{model}}^{-1/2}$ là cùng căn bậc hai như trong attention — mô hình lớn hơn nhận tốc độ học nhỏ hơn theo tỉ lệ — và việc chọn $\beta_2 = 0{,}98$ (thay vì $0{,}999$ thông thường) là một trung bình trượt *ngắn hơn* của các bình phương gradient, làm cho thang thích ứng phản ứng nhanh hơn — phù hợp khi độ lớn gradient dao động.

**Vị trí của dropout.** Dropout với tỉ lệ $0{,}1$ được áp dụng vào đầu ra của mỗi tầng con trước khi cộng dư và vào tổng nhúng-cộng-mã hóa vị trí. Vì luồng dư là một tổng tích lũy các hiệu chỉnh, dropout hoạt động như nhiễu được đưa vào các hiệu chỉnh — một bộ chính quy hóa lên chính cấu trúc đồng nhất-dư, ngăn bất kỳ tầng nào trở nên không thể thiếu và buộc mô hình phân bố phép tính theo độ sâu.

## Nâng cao I — Sức mạnh biểu diễn: xấp xỉ phổ dụng, Turing, và giới hạn

Tầng 1 và 2 trả lời câu hỏi *kiến trúc này tính gì*; tầng này trả lời câu hỏi *kiến trúc này có thể biểu diễn được những hàm nào*. Ba kết quả, theo thứ tự tăng dần của độ tinh tế [^14][^15][^16][^17].

```theorem[Xấp xỉ phổ dụng (Yun, Bhojanapalli, Rawat, Reddi, Kumar 2020)]
(i) Transformer với positional encoding xấp xỉ đều được mọi hàm liên tục $f: K \to \mathbb{R}^{n \times d}$ trên tập compact $K \subseteq \mathbb{R}^{n \times d}$: với mọi $\varepsilon > 0$ tồn tại một transformer $T$ (số tầng hằng số, không phụ thuộc $n, d$) sao cho $\sup_{X \in K} \|f(X) - T(X)\|_{\infty} < \varepsilon$.\
(ii) Không có positional encoding, transformer xấp xỉ đều được chính xác lớp hàm *đẳng biến hoán vị* — lớp hàm tự nhiên trên các chuỗi coi như tập hợp.
```

Kết quả này đáng chú ý vì lượng tham số dùng chung trong transformer rất lớn (cùng trọng số áp dụng cho mọi vị trí): tính biểu diễn không bị mất đi vì chia sẻ tham số. Chứng minh gồm bốn bước, mỗi bước gắn với một thành phần kiến trúc:

```proof[Phác thảo chứng minh]
1. **Rời rạc hóa.** $f$ liên tục trên tập compact $K$ nên liên tục đều: với sai số cho phép, tồn tại phân hoạch hữu hạn $K$ thành các mảnh nhỏ sao cho $f$ gần như hằng trên mỗi mảnh. Chỉ cần transformer nhận diện được mảnh chứa đầu vào $X$ rồi xuất ra giá trị của $f$ trên mảnh đó.
2. **Ánh xạ ngữ cảnh (contextual mapping).** Đây là vai trò thật sự của self-attention trong chứng minh: với hai chuỗi khác nhau $X \ne Y$, tồn tại các tầng attention (softmax, chiều rộng cố định, temperature tiến về $0$) ánh xạ chúng vào các biểu diễn khác nhau *tại mọi vị trí* — mỗi chuỗi nhận một "mã" duy nhất phụ thuộc toàn bộ ngữ cảnh, không chỉ từng token riêng lẻ.
3. **Gom mã.** Một tầng attention thứ hai, cùng positional encoding, đọc mã của mảnh vào một vị trí cố định (chẳng hạn vị trí đầu tiên) — một phép tra cứu khóa–giá trị thuần túy.
4. **Bảng tra.** Mạng truyền thẳng cuối cùng (đủ rộng) thực hiện ánh xạ hằng-từng-mảnh: mỗi mã mảnh đến giá trị $f$ trên mảnh đó. Kết quả cổ điển của lý thuyết xấp xỉ: mạng hai tầng với ReLU nội suy được mọi hàm hằng-từng-mảnh trên tập hữu hạn điểm. Mảnh đủ nhỏ thì sai số dưới $\varepsilon$.
```

```remark
Bốn bước phân công vai trò chính xác: attention làm *trộn ngữ cảnh* (bước 2–3), FFN làm *biến đổi đặc trưng* (bước 4) — đúng hai vai trò đã phân tích ở Tầng 2, giờ được chứng minh là đủ và cần thiết. Chú ý softmax thực tế không phải hard attention; các biến thể hiện đại của định lý (xấp xỉ phổ dụng với softmax trơn, với chiều rộng bị chặn) là hướng phát triển của chính dòng kết quả này.
```

Xấp xỉ phổ dụng là một kết quả *tồn tại*: nó không nói gì về việc gradient descent có tìm được bộ tham số đó không. Kết quả thứ hai nói về sức mạnh *tính toán*:

```theorem[Tính Turing đầy đủ (Pérez, Barceló, Marinkovic 2021)]
Transformer với hard attention, độ chính xác số vô hạn và ngữ cảnh không giới hạn mô phỏng được mọi máy Turing: với mỗi máy Turing $M$ tồn tại một transformer nhận mã của $M$ và đầu vào, mô phỏng từng bước chuyển trạng thái, và dừng đúng khi $M$ dừng.
```

```proof[Ý tưởng]
Ba thành phần kiến trúc đủ để mô phỏng: residual stream đóng vai băng nhớ (mỗi vị trí là một ô băng, ghi bằng phép chiếu); attention đóng vai *dịch chuyển* và *đọc* — một đầu attention có thể chuyển nội dung giữa các vị trí liên tiếp, mô phỏng việc di chuyển đầu đọc; FFN đóng vai hàm chuyển trạng thái của máy. Với hard attention, mọi phép chọn đều chính xác, nên chuỗi các tầng lặp đúng vòng lặp của máy Turing.
```

Hai kết quả trên dùng độ chính xác vô hạn. Kết quả thứ ba cho thấy điều gì xảy ra khi số học bị giới hạn — đúng như transformer thực tế:

```theorem[Giới hạn log-precision (Hahn 2020; Liu, Ash, Goel, Krishnamurthy, Zhang 2022)]
(i) (Hahn) Với attention trung bình-cứng (average-hard) và độ chính xác vô hạn, mỗi vị trí đầu ra chỉ phụ thuộc vào một cửa sổ cố định quanh nó; do đó transformer không thể nhận diện ngôn ngữ PARITY — tính chẵn lẻ của số ký hiệu $1$ — vốn đòi hỏi thông tin toàn cục.\
(ii) (Liu et al.) Transformer với độ chính xác logarit (log-precision) và số tầng hằng số tương đương với mạch ngưỡng độ sâu hằng số ($\mathrm{TC}^0$): nó tính được chính xác lớp hàm của lớp phức tạp đó, không hơn.
```

```remark[Ba kết quả, ba chế độ]
Ba định lý này không mâu thuẫn: chúng nói về ba chế độ khác nhau — độ chính xác vô hạn với softmax/hard attention (xấp xỉ mọi hàm liên tục), độ chính xác vô hạn với hard attention (tính được mọi hàm đệ quy), và độ chính xác hữu hạn với số tầng hằng số (chỉ tính được $\mathrm{TC}^0$). Transformer thực tế sống ở chế độ thứ ba, nên sức mạnh của chúng trong thực hành đến từ việc *kết hợp* tính tuần tự của suy luận (chain-of-thought, các bước giải mã nối tiếp) với tính biểu diễn của mỗi bước — một quan sát sau này được kiểm chứng bằng thực nghiệm ở các mô hình suy luận.
```

## Nâng cao II — Lý thuyết tổng quát hóa: vì sao mô hình học được

Xấp xỉ phổ dụng trả lời "có thể biểu diễn"; lý thuyết học thống kê trả lời "học được và không quá khớp". Khuôn khổ chuẩn: dữ liệu $\{(x_i, y_i)\}$ độc lập cùng phân phối theo $\mathcal{D}$ chưa biết; mô hình chọn $h$ từ lớp $\mathcal{H}$ để cực tiểu hóa lỗi trên mẫu. Hai chặn dưới đây là các kết quả cổ điển của học thống kê: chặn Rademacher của Bartlett–Mendelson [^18], và các chặn cụ thể cho self-attention của Edelman và cộng sự [^19].

```definition[Lỗi kỳ vọng và lỗi mẫu]
Với hàm mất mát $\ell$ và giả thuyết $h \in \mathcal{H}$: lỗi kỳ vọng $R(h) = \mathbb{E}_{(x,y)\sim\mathcal{D}}[\ell(h(x), y)]$ và lỗi mẫu $\hat{R}(h) = \tfrac{1}{n}\sum_i \ell(h(x_i), y_i)$. Khoảng cách tổng quát hóa là $R(h) - \hat{R}(h)$: phần lỗi trên dữ liệu chưa thấy vượt lỗi trên dữ liệu đã thấy.
```

```definition[Độ phức tạp Rademacher]
Với lớp hàm $\mathcal{F} \subseteq \{f: X \to [0,1]\}$,
$$\mathcal{R}_n(\mathcal{F}) = \mathbb{E}_{\sigma, x}\left[ \sup_{f \in \mathcal{F}} \frac{1}{n} \sum_{i=1}^{n} \sigma_i f(x_i) \right],$$
trong đó $\sigma_i \in \{\pm 1\}$ là các biến Rademacher độc lập. Đại lượng này đo "khả năng khớp nhiễu" của lớp: nếu lớp có thể khớp mọi dấu ngẫu nhiên $\sigma_i$ thì độ phức tạp lớn.
```

```theorem[Chặn Rademacher (Bartlett–Mendelson 2002)]
Với xác suất ít nhất $1 - \delta$ trên mẫu i.i.d. cỡ $n$,
$$\sup_{f \in \mathcal{F}} \bigl(R(f) - \hat{R}(f)\bigr) \;\le\; 2\,\mathcal{R}_n(\mathcal{F}) + \sqrt{\frac{\ln(1/\delta)}{2n}}.$$
Khoảng cách tổng quát hóa bị chặn bởi độ phức tạp Rademacher cộng một số hạng nhỏ theo $n$.
```

Để áp dụng cho transformer, ta cần một quan sát đơn giản nhưng then chốt về attention:

```lemma[Attention là phép co trên $\ell_\infty$]
Cho $A$ là ma trận ngẫu nhiên theo hàng. Với mọi $V, V'$:
$$\|AV - AV'\|_{\infty} \;\le\; \|V - V'\|_{\infty}.$$
Phép làm trơn theo hàng không làm tăng khoảng cách $\ell_\infty$ giữa các chuỗi.
```

```proof
Hàng $i$ của $AV$ là tổ hợp lồi $\sum_j A_{ij}\, V_{j\cdot}$, nên $|(AV - AV')_{i\cdot}| \le \sum_j A_{ij} |V_{j\cdot} - V'_{j\cdot}| \le \max_j |V_{j\cdot} - V'_{j\cdot}|$, với đẳng thức của chuẩn $\ell_\infty$ theo hàng.
```

```remark
Tính co này là vì sao các chặn tổng quát hóa của transformer không bùng nổ theo độ sâu: mỗi tầng attention đóng góp hệ số $\le 1$ vào chuẩn $\ell_\infty$, độ sâu $L$ chỉ xuất hiện *tuyến tính* trong các chặn (tổng trên tầng của các đại lượng phụ thuộc chuẩn ma trận, chia $\sqrt{n}$) chứ không theo cấp số nhân — đúng dạng chặn Rademacher cho self-attention. Câu trả lời định tính cho "vì sao mô hình hàng trăm tỉ tham số vẫn tổng quát hóa": lớp hàm của chúng có độ phức tạp Rademacher được kiểm soát bởi chuẩn trọng số, không phải bởi số tham số.
```

Hiện tượng *descent kép* (double descent), được Belkin và cộng sự tài liệu hóa [^20], cho thấy lỗi kiểm tra giảm trở lại trong vùng quá tham số hóa:

```remark[Vùng quá tham số hóa và nội suy]
Khi số tham số vượt số mẫu, mô hình nội suy dữ liệu (lỗi mẫu $\to 0$) nhưng vẫn tổng quát hóa — điều mà đánh đổi bias–variance cổ điển không dự đoán. Transformer hiện đại sống trong vùng này; chặn Rademacher giải thích được một phần (chuẩn, không phải số tham số, kiểm soát độ phức tạp) và để lại phần còn lại — cấu trúc của dữ liệu tự nhiên — cho các lý thuyết chưa hoàn chỉnh.
```

## Nâng cao III — Hình học thông tin của attention

Softmax không chỉ là một hàm kích hoạt: nó là *ánh xạ mũ* của họ mũ rời rạc, và nhìn qua lăng kính này, nhiều hiện tượng của attention — bão hòa, sụp đổ entropy, nhiệt độ — là hình học của một đa tạp.

```definition[Họ mũ rời rạc và tham số tự nhiên]
Phân phối categorical $p$ trên $\{1, \dots, m\}$ viết được thành
$$p_j = \frac{e^{z_j}}{Z}, \qquad Z = \sum_j e^{z_j},$$
với tham số tự nhiên $z \in \mathbb{R}^m$ (xác định sai khác hằng số cộng). Hàm phân hoạch logarit là $A(z) = \log \sum_j e^{z_j} = \operatorname{LSE}(z)$.
```

```lemma[Softmax là gradient của hàm phân hoạch]
$$\frac{\partial A}{\partial z_j}(z) = \frac{e^{z_j}}{Z} = p_j, \qquad \frac{\partial^2 A}{\partial z_j \partial z_k}(z) = p_j(\delta_{jk} - p_k),$$
tức là $p = \nabla A(z)$, và Hessian của $A$ vừa là ma trận hiệp phương sai của $p$ vừa là ma trận thông tin Fisher — chính là ma trận Jacobi của softmax đã gặp ở Tầng 1.
```

```proof
Đạo hàm trực tiếp: $\partial A/\partial z_j = e^{z_j}/Z$; đạo hàm cấp hai theo quy tắc thương, hoặc nhận xét rằng Jacobi của ánh xạ $z \mapsto \nabla A(z)$ là $\operatorname{diag}(p) - pp^\top$.
```

```theorem[Đối ngẫu Legendre: entropy là liên hợp lồi của $A$]
Hàm $A$ lồi, và biến đổi Legendre của nó trên phần trong của đơn hình là
$$A^{*}(p) = \sup_{z}\left\{ z \cdot p - A(z) \right\} = \sum_j p_j \log p_j = -H(p).$$
Cặp đối ngẫu khôi phục lẫn nhau: $p = \nabla A(z)$ và $z = \nabla A^{*}(p)$ (sai khác hằng số).
```

```proof
Cực đại đạt tại $z$ với $p = \nabla A(z) = \operatorname{softmax}(z)$, tức $z_j = \log p_j + c$; chọn $c = 0$ được $z \cdot p - A(z) = \sum p_j \log p_j - \log\!\sum_j p_j = \sum p_j \log p_j$.
```

Đối ngẫu này nâng cấp bổ đề "softmax là nghiệm cực đại entropy" (Tầng 0) thành một câu chuyện đầy đủ: softmax và entropy là hai mặt của cùng một phép biến đổi lồi, và thông tin Fisher là độ cong của chính hàm lồi đó; đối ngẫu Legendre giữa hàm phân hoạch và entropy là kết quả chuẩn của lý thuyết họ mũ [^21]. Hệ quả quan trọng nhất là cách đọc attention như *cân bằng nhiệt*:

```proposition[Attention là phân phối Gibbs]
Cho một truy vấn $q$, các khóa $k_j$ và chi phí $c_j = -q^\top k_j/\sqrt{d_k}$. Hàng attention $p = \operatorname{softmax}(q^\top k/\sqrt{d_k})$ là nghiệm duy nhất của bài toán cực tiểu hóa năng lượng tự do
$$\min_{p \in \Delta^{m-1}}\; \left\{ \langle p, c\rangle - H(p) \right\},$$
tức là cực tiểu kỳ vọng chi phí dưới phạt entropy — phân phối Gibbs ở nhiệt độ $1$. Với hệ số nhiệt độ $\beta$, $p_j \propto e^{-\beta c_j}$: hệ số tỉ lệ $1/\sqrt{d_k}$ của bài báo chính là *nhiệt độ* của hệ.
```

```proof
Viết nhân tử Lagrange cho $\min_p \{ \langle p,c\rangle + \sum_j p_j\log p_j \}$ với ràng buộc $\sum_j p_j = 1$: đạo hàm theo $p_j$ cho $c_j + \log p_j + 1 + \lambda = 0$, suy ra $p_j \propto e^{-c_j} = e^{q^\top k_j/\sqrt{d_k}}$.
```

Cấu trúc Gibbs này có một tên gọi trong vận chuyển tối ưu [^22]:

```remark[Vận chuyển tối ưu entropy]
Bài toán $\min_{P} \{ \langle P, C\rangle - H(P) \}$ với ràng buộc biên có nghiệm là các phân phối Gibbs $P_{ij} \propto e^{-C_{ij}}$ (chuẩn hóa Sinkhorn). Attention là bản "một phía" của bài toán đó: mỗi hàng là một phân phối Gibbs riêng, không có ràng buộc biên chung; các biến thể doubly-stochastic của attention (Sinkformer) thêm đúng ràng buộc còn thiếu để attention trở thành một phép vận chuyển tối ưu đầy đủ.
```

```remark[Hình học: metric Fisher và sụp đổ entropy]
Trên đơn hình, metric Fisher $ds^2 = \sum_j dp_j^2/p_j$ làm đơn hình thành một đa tạp với độ cong âm; entropy lồi chặt và đạt cực đại tại tâm. Sụp đổ entropy là dòng chảy của các phân phối attention về biên của đơn hình — nơi metric suy biến (thông tin Fisher $\to 0$, đã thấy ở Tầng 1) — và hệ số tỉ lệ $\sqrt{d_k}$ là lực giữ hệ ở phần trong, nơi hình học không suy biến. "Bão hòa", "gradient biến mất", "entropy giảm", "thông tin Fisher suy biến" là bốn tên của cùng một hiện tượng hình học.
```

## Nâng cao IV — Lý thuyết phổ của chuỗi Markov attention

Ở Tầng 1, ma trận attention $A$ được đọc như ma trận chuyển tiếp của một chuỗi Markov trên $n$ vị trí. Giờ ta đưa cách đọc đó đến kết quả: lý thuyết phổ cho biết chính xác khi nào và nhanh đến đâu attention sâu hội tụ về một phân phối chung. Các định lý của mục này là kết quả chuẩn của lý thuyết chuỗi Markov [^23][^24].

```definition[Chuỗi Markov hữu hạn]
Chuỗi Markov với ma trận chuyển $P$ (ngẫu nhiên theo hàng): $\mathbb{P}(X_{t+1} = j \mid X_t = i) = P_{ij}$. Phân phối bất biến $\pi$ thỏa $\pi P = \pi$. Chuỗi bất khả quy (mọi trạng thái đến được với nhau) và không tuần hoàn khi và chỉ khi tồn tại duy nhất $\pi > 0$ và $P^t \to \mathbf{1}\pi$ theo từng hàng.
```

```theorem[Perron–Frobenius]
Cho $P$ ngẫu nhiên theo hàng, bất khả quy và không tuần hoàn. Số $\lambda = 1$ là trị riêng đơn với vector riêng phải $\mathbf{1}$ và vector riêng trái $\pi > 0$ (phân phối bất biến); mọi trị riêng khác thỏa $|\lambda| < 1$. Tốc độ hội tụ được quyết định bởi khe phổ (spectral gap) $\gamma = 1 - \max\{|\lambda| : \lambda \ne 1\}$:
$$\|P^t(x,\cdot) - \pi\|_{\mathrm{TV}} \;\le\; C\, (1-\gamma)^t,$$
với chuỗi thuận nghịch có thể lấy $C = \tfrac{1}{2}\sqrt{1/\pi_{\min}}$. Thời gian trộn $\tau_{\mathrm{mix}}(\varepsilon) \asymp \tfrac{1}{\gamma}\log\tfrac{1}{\varepsilon}$.
```

```lemma[Hệ số ergodicity Dobrushin]
Hệ số Dobrushin của $P$ là khoảng cách toàn biến lớn nhất giữa hai hàng:
$$\delta(P) = \max_{i,j} \; d_{\mathrm{TV}}(P_{i\cdot}, P_{j\cdot}) \in [0,1].$$
Với mọi phân phối $\mu, \nu$: $d_{\mathrm{TV}}(\mu P, \nu P) \le \delta(P)\, d_{\mathrm{TV}}(\mu, \nu)$, và với hai ma trận $\delta(PQ) \le \delta(P)\delta(Q)$.
```

```proof
Khoảng cách toàn biến giữa $\mu P$ và $\nu P$ là $\tfrac{1}{2}\sum_j |\sum_i (\mu_i - \nu_i) P_{ij}| = \tfrac{1}{2}\sum_j |(\mu-\nu) P_{\cdot j}|$. Đây là chuẩn $\ell_1$ của phép nhân $P$ tác động lên vector hàng $\mu - \nu$; chuẩn toán tử $\ell_1$-to-$\ell_1$ của $P$ đúng bằng $\max_{i,j} \tfrac{1}{2}\sum_k |P_{ik} - P_{jk}| = \delta(P)$ — kết quả cổ điển của Dobrushin về chuẩn toán tử của ma trận ngẫu nhiên.
```

```theorem[Hợp thành attention và sự đồng nhất hóa]
Cho $A_1, \dots, A_L$ là các ma trận attention (ngẫu nhiên theo hàng) của $L$ tầng và $\Pi = A_L \cdots A_1$. Nếu tích các hệ số Dobrushin co đều $\delta(A_1)\cdots\delta(A_L) \to 0$ khi $L \to \infty$, thì các hàng của $\Pi$ hội tụ về một phân phối chung: $\Pi \to \mathbf{1}\pi$ với $\pi = \mu A_1 \cdots A_L$ bất kỳ $\mu$ — mọi vị trí cuối cùng đọc cùng một phối trộn các vị trí đầu vào.
```

```proof
Từ $\delta(\Pi) \le \prod_t \delta(A_t) \to 0$, khoảng cách toàn biến giữa hai hàng bất kỳ của $\Pi$ tiến về $0$: tất cả các hàng tiến về cùng một phân phối; phân phối đó là $\pi$ vì mọi hàng là $\mu A_1 \cdots A_L$ với $\mu$ là một hàng của $A_1$.
```

Hai hiện tượng thực nghiệm — sụp đổ entropy [^9] và attention sinks [^10] — đọc được chính xác trong khuôn khổ này:

```remark[Sụp đổ entropy và attention sinks là hệ quả của định lý]
Khi attention còn mềm ($\delta(A_t) < 1$), xếp chồng nhiều tầng làm các hàng tiến về một phân phối chung — entropy của các hàng giảm dần, đúng hiện tượng *sụp đổ entropy* quan sát được. Vị trí mà phân phối chung $\pi$ tập trung khối lượng chính là *attention sink*: mọi vị trí cuối cùng đều đọc chủ yếu ở vài token cố định. Chú ý sự tinh tế: khi attention bão hòa thành one-hot, $\delta(A_t) \to 1$ — các hàng khác nhau trỏ các nơi khác nhau, phép co chậm lại; hiện tượng sink quan sát được đòi hỏi sự phối hợp giữa các tầng khiến các hàng cùng hướng về một tập vị trí chung. Định lý cho điều kiện đủ chính xác; đặc trưng đầy đủ trên các toán tử attention học được vẫn là một định lý mở.
```

```remark[Can thiệp thực nghiệm là can thiệp phổ]
Các biện pháp chống sụp đổ entropy trong thực hành — chính quy hóa độ sắc nét, token chìm cố định, tái chuẩn hóa — đều là các can thiệp lên phổ của toán tử ngẫu nhiên: tăng khe phổ, chặn $\delta$ dưới $1$, hoặc neo phân phối bất biến về một vị trí cố định. Lý thuyết Markov biến "mẹo kỹ thuật" thành phép toán trên phổ.
```

## Nâng cao V — Kernel, RKHS và attention tuyến tính

Tầng 1 đã đọc attention như hồi quy Nadaraya–Watson. Tầng này đưa cách đọc kernel đến công cụ đầy đủ — không gian Hilbert tái tạo — rồi dùng nó để phá rào cản bậc hai. Các định lý Mercer và Bochner là kết quả chuẩn của lý thuyết RKHS [^27], còn đặc trưng Fourier ngẫu nhiên là của Rahimi–Recht [^5].

```theorem[Mercer]
Cho kernel liên tục, đối xứng, xác định dương $k$ trên tập compact $X$ với độ đo $\rho$ hữu hạn. Tồn tại các hàm riêng $\varphi_1, \varphi_2, \dots$ trực giao và các trị riêng $\lambda_1 \ge \lambda_2 \ge \dots \ge 0$ sao cho
$$k(x,y) = \sum_{r \ge 1} \lambda_r\, \varphi_r(x)\varphi_r(y),$$
hội tụ tuyệt đối và đều.
```

```theorem[Bochner]
Kernel $k(x,y) = k(x-y)$ (bất biến tịnh tiến), liên tục, xác định dương khi và chỉ khi tồn tại độ đo xác suất $\mu$ trên $\mathbb{R}^d$ sao cho
$$k(x-y) = \int_{\mathbb{R}^d} e^{i\omega \cdot (x-y)}\, d\mu(\omega)$$
— kernel bất biến tịnh tiến là biến đổi Fourier ngược của một độ đo xác suất, gọi là phổ.
```

Hệ quả thực dụng của Bochner: nếu kernel có phổ $\mu$, lấy mẫu $m$ tần số $\omega_1, \dots, \omega_m$ từ $\mu$ và đặt $\varphi(x) = \sqrt{2/m}\,(\cos(\omega_1\cdot x + b_1), \dots, \cos(\omega_m\cdot x + b_m))$ với $b_i$ đều trên $[0, 2\pi]$, thì $k(x,y) \approx \langle \varphi(x), \varphi(y)\rangle$ — các *đặc trưng Fourier ngẫu nhiên* của Rahimi–Recht [^5], với sai số $O(m^{-1/2})$ đều trên tập compact (sai số tỉ lệ với độ phức tạp của lớp hàm, theo chặn Rademacher ở Nâng cao II). Với kernel mũ của attention, có một đặc trưng ngẫu nhiên còn trực tiếp hơn — đặc trưng FAVOR+ của Performer [^8]:

```lemma[Đặc trưng ngẫu nhiên cho kernel mũ (FAVOR+)]
Cho $w \sim \mathcal{N}(0, I_d)$. Khi đó
$$\mathbb{E}_w\left[ e^{w\cdot q - \|q\|^2/2}\, e^{w\cdot k - \|k\|^2/2} \right] = e^{q\cdot k}.$$
Do đó $\varphi(q) = e^{w\cdot q - \|q\|^2/2}$ là một ánh xạ đặc trưng ngẫu nhiên ước lượng không chệch kernel mũ $e^{q\cdot k}$ — nền tảng của Performer.
```

```proof
Kỳ vọng $\mathbb{E}_w[e^{w\cdot (q+k)}]$ là hàm đặc trưng moment của phân phối chuẩn: $e^{\|q+k\|^2/2}$. Nhân với $e^{-(\|q\|^2+\|k\|^2)/2}$ được $e^{q\cdot k}$.
```

Hệ quả cấu trúc của đặc trưng hữu hạn chiều là phép phân rã tổng — attention tuyến tính [^7][^8]:

```theorem[Attention tuyến tính]
Nếu kernel mũ được xấp xỉ bằng ánh xạ đặc trưng hữu hạn chiều $\langle \varphi(q), \varphi(k)\rangle \approx e^{q^\top k/\sqrt{d_k}}$, thì đầu ra attention phân rã được:
$$(AV)_{i\cdot} \approx \frac{\varphi(q_i)^\top \sum_j \varphi(k_j)\, V_{j\cdot}}{\varphi(q_i)^\top \sum_j \varphi(k_j)},$$
và các tổng $\sum_j \varphi(k_j) V_{j\cdot}^\top$ cùng $\sum_j \varphi(k_j)$ được tính *một lần* với chi phí $O(n)$ — attention tuyến tính, chi phí $O(n)$ thay vì $O(n^2)$.
```

```remark[Vì sao $O(n^2)$ là một tuyên bố về thông tin]
Attention chính xác buộc mọi cặp $(i,j)$ gặp nhau trong một tích vô hướng — $O(n^2)$ là chi phí tất yếu của việc truyền thông tin mọi-cặp. Xấp xỉ kernel bằng đặc trưng là cách duy nhất để thoát: nó thay "mọi cặp gặp nhau" bằng "mọi truy vấn gặp mọi khóa qua một phép chiếu trung gian". Nâng cao II cho biết giá phải trả chính xác — sai số xấp xỉ tỉ lệ $m^{-1/2}$ với $m$ là số đặc trưng — và multi-head (Tầng 1) là một tổ hợp của $h$ kernel như vậy, mỗi cái trên một không gian con riêng.
```

## Nâng cao VI — Hệ động lực và hình học của biểu diễn

Tầng 2 đã đọc kết nối dư như bước Euler của một phương trình vi phân. Tầng này đẩy cách đọc đó tới hệ động lực và hình học của không gian biểu diễn. Cách đọc ODE này đã được hình thức hóa thành mô hình độ sâu liên tục bởi Chen và cộng sự [^25].

```definition[Mạng dư là rời rạc hóa của một dòng chảy]
$\frac{x_{t+1} - x_t}{1} = f_t(x_t)$ là bước Euler (hệ số bước $1$) của phương trình vi phân thường
$$\frac{dx}{ds} = F_s(x),$$
với $F_s$ là nội suy của các $f_t$. Một transformer sâu là một bộ tích phân số của một dòng chảy liên tục trên không gian các biểu diễn token: độ sâu là thời gian tích phân.
```

```remark[Ổn định: độ sâu là thời gian, huấn luyện là ổn định của dòng chảy]
Trong khung này, "vì sao transformer sâu huấn luyện được" là câu hỏi về độ ổn định của dòng chảy rời rạc hóa. Kết nối dư giữ Jacobian gần $I$ (Tầng 2), nên dòng chảy gần đẳng cực: không co về không (gradient biến mất) cũng không phình to (bùng nổ gradient) theo độ sâu. Các đại lượng của hệ động lực — số mũ Lyapunov, chuẩn phổ của Jacobian — là các công cụ đo lường chính xác "độ sâu bao nhiêu là vừa". Hướng nghiên cứu này đã sinh ra các mô hình độ sâu liên tục (Neural ODE) và cùng một phép rời rạc hóa nằm dưới các mô hình khuếch tán dựa trên score.
```

Khuôn khổ *học sâu hình học* của Bronstein và cộng sự [^26] đặt các kiến trúc trong một bức tranh thống nhất:

```remark[Hình học của không gian biểu diễn]
Ba quan sát hình học đã gặp trong bài giờ hiện ra như một bức tranh thống nhất: LayerNorm chiếu mỗi token lên mặt cầu bán kính $\sqrt{d}$ (Tầng 2); attention là phép làm trơn dọc theo các cạnh của một đồ thị đầy đủ có trọng số học được — đúng khuôn khổ *học sâu hình học*, trong đó các kiến trúc là các phép toán đẳng biến trên các đối tượng có cấu trúc (lưới, nhóm, đồ thị, đa tạp); và luồng dư định nghĩa một liên thông nền phẳng trên không gian biểu diễn. Các quan sát thực nghiệm — biểu diễn học được có cấu trúc tuyến tính (linear probes, steering vectors), dữ liệu chiều cao sống gần một đa tạp chiều thấp (giả thuyết đa tạp), các tầng sâu làm "tách pha" ngữ nghĩa — là những mảnh của một lý thuyết hình học về học sâu vẫn đang hình thành.
```

```remark[Điểm nối với toán học hiện đại]
Positional encoding là một dòng chảy tuyến tính trên xuyến (Tầng 2); rotary embedding của các mô hình sau này là cùng ý tưởng với nhóm quay $SO(2)$ thay cho phép quay theo thời gian; attention như làm trơn trên đồ thị đầy đủ là một trường hợp của truyền thông điệp (message passing) trên đồ thị; và phân phối Gibbs (Nâng cao III) nối attention với cơ học thống kê và vận chuyển tối ưu. Transformer, dưới góc nhìn này, là một điểm gặp của bốn nhánh toán học: xác suất, hình học, tổ hợp và giải tích số.
```

## Các câu hỏi còn bỏ ngỏ

Các phần nâng cao trả lời được nhiều câu hỏi "có hay không" — có xấp xỉ phổ dụng, có Turing đầy đủ, có co theo Dobrushin — nhưng để lại những câu hỏi mà giới nghiên cứu chưa đóng được:

- **Vì sao kernel học được $q^\top k$ lại tốt?** Xấp xỉ phổ dụng nói transformer *có thể* biểu diễn mọi hàm liên tục; nó không nói gì về việc vì sao *gradient descent* tìm được một hàm tốt, hay vì sao $W_Q W_K^\top$ sau huấn luyện lại là một hàm tương hợp tốt. Khoảng trống giữa "có thể biểu diễn" và "học được" là câu hỏi trung tâm của lý thuyết học sâu hiện đại.
- **Khi nào hợp thành attention còn trộn thông tin?** Hệ số Dobrushin cho một điều kiện đủ (co đều) cho sụp đổ entropy; một đặc trưng đầy đủ — điều kiện cần và đủ, trên các toán tử attention *học được* — vẫn là một định lý mở.
- **Attention có giải thích được không?** Các hàng của $A$ là các phân phối điều kiện mô tả phép tính của mô hình, không phải lời giải thích nhân quả cho dự đoán; các hạn chế nổi tiếng của giải thích dựa trên attention [^11] là các yếu tố gây nhiễu thống kê, và ranh giới chính xác giữa "mô tả" và "giải thích" chưa có lý thuyết.
- **Hình học.** LayerNorm đặt biểu diễn trên mặt cầu, luồng dư định nghĩa một liên thông nền phẳng, softmax là ánh xạ mũ của đơn hình, attention là làm trơn trên đồ thị đầy đủ — kiến trúc chứa đầy cấu trúc hình học mà một lý thuyết hình học về học sâu mới chỉ bắt đầu đặt tên. Câu hỏi nền: vì sao các biểu diễn học được lại có cấu trúc tuyến tính đẹp đến vậy (linear probes, steering vectors) khi toàn bộ kiến trúc là phi tuyến?
- **Chi phí.** Attention tuyến tính trả giá bằng độ chính xác xấp xỉ kernel; câu hỏi mở là đánh đổi tối ưu giữa chi phí và độ trung thực, và liệu có những cấu trúc (thưa, phân cấp, cửa sổ, đồ thị) vượt qua được cả hai.

## Lộ trình học tiếp

Bài viết dừng ở ranh giới kiến thức có thể chứng minh. Để đi tiếp, một lộ trình tài liệu có thứ tự:

1. **Nền tảng (đào sâu Tầng 0):** *Linear Algebra Done Right* (Axler) cho đại số tuyến tính; *Probability: Theory and Examples* (Durrett) hoặc *Probability and Random Processes* (Grimmett–Stirzaker) cho xác suất; *Information Theory, Inference, and Learning Algorithms* (MacKay) cho lý thuyết thông tin.
2. **Học thống kê:** *Foundations of Machine Learning* (Mohri, Rostamizadeh, Talwalkar) — Rademacher, PAC, sample complexity ở mức giáo trình.
3. **Chuỗi Markov:** *Markov Chains and Mixing Times* (Levin–Peres) — lý thuyết phổ và thời gian trộn ở mức chuẩn của ngành xác suất.
4. **Kernel và RKHS:** *Reproducing Kernel Hilbert Spaces in Probability and Statistics* (Berlinet–Thomas-Agnan) — Mercer, Bochner, RKHS.
5. **Hình học thông tin:** *Information Geometry and Its Applications* (Amari) — họ mũ, metric Fisher, phép chiếu.
6. **Các bài báo gốc** được trích dẫn trong bài — đọc theo thứ tự xuất hiện của chú thích, từ Vaswani et al. (2017) đến các bài nâng cao ở cuối bài.

Mục tiêu của lộ trình: sau khi đọc xong Tầng 3 của bài này và bốn cuốn đầu, bạn đọc được các bài báo lý thuyết về transformer một cách trực tiếp — mức độ "đọc nghiên cứu" tương đương một nghiên cứu sinh toán.

## Tóm tắt

Bài báo "Attention Is All You Need" gồm bốn công thức và một luận điểm. Bốn công thức: một phép làm trơn kernel ngẫu nhiên theo hàng (attention tích vô hướng có tỉ lệ), một tổ hợp các phép làm trơn hạng thấp (attention đa đầu), một ánh xạ phi tuyến theo từng vị trí (FFN), và một dòng chảy tuyến tính trên xuyến (mã hóa vị trí) — được bọc trong một luồng dư là rời rạc hóa của một hệ động lực, và được huấn luyện với một hàm mục tiêu giữ mọi phân phối xác suất ở phần trong của đơn hình. Luận điểm: bài toán chuyển đổi chuỗi không cần truy hồi hay tích chập; việc trộn thông tin giữa các vị trí, biến đổi đặc trưng và điều kiện hóa đầu ra theo đầu vào đều có thể thực hiện bằng các toán tử tuyến tính song song, kết nối mọi cặp vị trí, kết hợp với các ánh xạ phi tuyến theo từng điểm. Các kiến trúc mô hình ngôn ngữ lớn sau này đều là sự phát triển từ bốn công thức này. Mỗi lựa chọn thiết kế của bài báo — hệ số tỉ lệ, mã hóa vị trí, làm trơn nhãn, lịch trình tốc độ học — đều có một nội dung toán học: phương sai, kernel, chuỗi Markov, hình học thông tin và hệ động lực.

Bốn tầng của bài viết phản ánh bốn mức hiểu biết về cùng một kiến trúc. Tầng 0 cung cấp đúng lượng công cụ — đại số tuyến tính, xác suất, giải tích, softmax, thông tin, kernel — để mọi khẳng định phía sau là lập luận chứ không phải niềm tin. Tầng 1 và 2 đọc từng công thức của bài báo như một định lý nhỏ: attention là phép làm trơn kernel ngẫu nhiên theo hàng, $\sqrt{d_k}$ là nhiệt độ giữ softmax khỏi bão hòa, mã hóa vị trí là một dòng chảy trên xuyến, luồng dư là một bộ tích phân số. Tầng 3 nối các quan sát này với bốn nhánh toán học trưởng thành: lý thuyết xấp xỉ và độ phức tạp (xấp xỉ phổ dụng, Turing đầy đủ, giới hạn $\mathrm{TC}^0$), lý thuyết học thống kê (Rademacher, co $\ell_\infty$), hình học thông tin (đối ngẫu Legendre, phân phối Gibbs, vận chuyển tối ưu entropy) và lý thuyết phổ của chuỗi Markov (Perron–Frobenius, Dobrushin). Đọc xong bốn tầng, một câu hỏi thực hành — "vì sao transformer huấn luyện được và tổng quát hóa được?" — trở thành một câu hỏi toán học với câu trả lời từng phần đã biết và phần còn lại đang mở.

[^1]: A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, I. Polosukhin, *Attention Is All You Need*, NeurIPS 2017, arXiv:1706.03762.
[^2]: D. Bahdanau, K. Cho, Y. Bengio, *Neural Machine Translation by Jointly Learning to Align and Translate*, ICLR 2015, arXiv:1409.0473.
[^3]: E. A. Nadaraya, *On estimating regression*, Theory Probab. Appl. 9 (1964), 141–142; G. S. Watson, *Smooth regression analysis*, Sankhyā A 26 (1964), 359–372.
[^4]: Y.-H. H. Tsai, S. Bai, M. Yamada, T. Morency, R. Salakhutdinov, *Transformer Dissection: A Unified Understanding of Transformer's Attention via the Lens of Kernel*, EMNLP 2019.
[^5]: A. Rahimi, B. Recht, *Random Features for Large-Scale Kernel Machines*, NeurIPS 2007.
[^6]: P. Shaw, J. Uszkoreit, A. Vaswani, *Self-Attention with Relative Position Representations*, NAACL 2018.
[^7]: A. Katharopoulos, A. Vyas, N. Pappas, F. Fleuret, *Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention*, ICML 2020.
[^8]: K. Choromanski, V. Likhosherstov, D. Dohan, X. Song, A. Gane, T. Sarlós, P. Hawkins, J. Davis, A. Mohiuddin, L. Kaiser, D. Belanger, L. Colwell, A. Weller, *Rethinking Attention with Performers*, ICLR 2021.
[^9]: S. Zhai, T. Likhomanenko, E. Littwin, D. Busbridge, J. Ramapuram, Y. Ji, J. M. Susskind, *Stabilizing Transformer Training by Preventing Attention Entropy Collapse*, ICML 2023.
[^10]: G. Xiao, Y. Tian, B. Chen, T. Han, M. Lewis, *Efficient Streaming Language Models with Attention Sinks*, ICLR 2024.
[^11]: S. Jain, B. C. Wallace, *Attention is not Explanation*, NAACL 2019.
[^12]: M. Geva, R. Schuster, J. Berant, O. Levy, *Transformer Feed-Forward Layers Are Key-Value Memories*, EMNLP 2021.
[^13]: J. L. Ba, J. R. Kiros, G. E. Hinton, *Layer Normalization*, arXiv:1607.06450, 2016.
[^14]: C. Yun, S. Bhojanapalli, A. S. Rawat, S. J. Reddi, S. Kumar, *Are Transformers Universal Approximators of Sequence-to-Sequence Functions?*, ICLR 2020, arXiv:1912.10077.
[^15]: J. Pérez, P. Barceló, J. Marinkovic, *Attention is Turing-Complete*, JMLR 22 (2021), arXiv:1909.04458.
[^16]: M. Hahn, *Theoretical Limitations of Self-Attention in Neural Sequence Models*, TACL 8 (2020), 156–171.
[^17]: B. Liu, J. T. Ash, S. Goel, A. Krishnamurthy, C. Zhang, *Transformers Learn Shortcuts to Automata*, ICLR 2023, arXiv:2210.10749.
[^18]: P. L. Bartlett, S. Mendelson, *Rademacher and Gaussian Complexities: Risk Bounds and Structural Results*, JMLR 3 (2002), 463–482.
[^19]: B. L. Edelman, S. Goel, S. Kakade, C. Zhang, *Inductive Biases and Variable Creation in Self-Attention Architectures*, ICML 2022, arXiv:2110.05789.
[^20]: M. Belkin, D. Hsu, S. Ma, S. Mandal, *Reconciling Modern Machine-Learning Practice and the Classical Bias–Variance Trade-off*, PNAS 116 (2019), 15849–15854.
[^21]: M. J. Wainwright, M. I. Jordan, *Graphical Models, Exponential Families, and Variational Inference*, Found. Trends Mach. Learn. 1 (2008), 1–305.
[^22]: M. Cuturi, *Sinkhorn Distances: Lightspeed Computation of Optimal Transport*, NeurIPS 2013.
[^23]: E. Seneta, *Non-negative Matrices and Markov Chains*, 2nd ed., Springer, 1981.
[^24]: D. A. Levin, Y. Peres, *Markov Chains and Mixing Times*, 2nd ed., AMS, 2017.
[^25]: R. T. Q. Chen, Y. Rubanova, J. Bettencourt, D. Duvenaud, *Neural Ordinary Differential Equations*, NeurIPS 2018.
[^26]: M. M. Bronstein, J. Bruna, T. Cohen, P. Veličković, *Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges*, 2021, arXiv:2104.13478.
[^27]: A. Berlinet, C. Thomas-Agnan, *Reproducing Kernel Hilbert Spaces in Probability and Statistics*, Kluwer, 2004.
