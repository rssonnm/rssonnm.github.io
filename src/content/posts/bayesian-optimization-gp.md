---
title: "Tối ưu hoá Bayes với Gaussian process cho thực nghiệm"
date: 2026-08-11T16:00:00
description: "Mô hình hoá hàm đáp ứng là hộp đen đắt tiền bằng Gaussian process và tối ưu hoá bằng hàm thu thập. Bài viết trình bày định nghĩa GP, kernel bình phương mũ, hậu nghiệm có điều kiện, hàm thu thập expected improvement với dạng đóng, và một ví dụ số hoàn chỉnh trên hàm bậc ba mà mô hình bề mặt đáp ứng bậc hai đã bỏ lỡ đỉnh. Các con số kiểm chứng: hậu nghiệm từ ba điểm, năm vòng lặp tìm ra đỉnh 14,815 tại x = 6,68, và marginal likelihood cho thấy việc chọn độ dài tương quan cần đủ dữ liệu."
topic: mathematics
tags: [bayesian-optimization, gaussian-process, expected-improvement, acquisition-function, black-box-optimization, experimental-design, machine-learning, tutorial]
featured: false
draft: false
---

Phần F của bài *Tối ưu hoá điều kiện chiết xuất dược liệu* kết thúc bằng một câu hỏi: khi mô hình bậc hai không đủ, làm gì? Câu trả lời của bài này là một hướng không giả định dạng hàm: thay vì khớp một đa thức rồi tin vào nó, ta xây một phân phối xác suất trên toàn bộ hàm đáp ứng, và mỗi vòng đo chọn điểm tiếp theo dựa trên phân phối đó. Đây là **tối ưu hoá Bayes (Bayesian optimization)** với mô hình **Gaussian process (GP)** — phương pháp chuẩn cho tối ưu hoá thực nghiệm khi mỗi lần đánh giá tốn kém [^1] [^2].

## Phần A — Hàm đáp ứng là hộp đen

```definition[Hàm hộp đen]
Một hàm đáp ứng $f: X \to \mathbb{R}$ được gọi là hộp đen khi ta chỉ có thể đánh giá $f(x)$ tại từng điểm, không có đạo hàm, không biết dạng giải tích, và mỗi lần đánh giá tốn kém: một mẻ chiết xuất tốn giờ vận hành, hoá chất và thiết bị. Ngân sách thực tế là vài chục lần đánh giá, không phải vài nghìn. Bài toán: tìm $\max_{x \in X} f(x)$ trong giới hạn đó.
```

Hai giả định ở đây khác hẳn bề mặt đáp ứng bậc hai ở bài chiết xuất. RSM giả định dạng hàm (đa thức bậc hai) và dùng một thiết kế cố định; sai số chỉ đến từ nhiễu đo. BO không giả định dạng hàm — nó giả định *độ trơn* (qua kernel) — và các điểm đo được chọn tuần tự, điểm sau dựa trên điểm trước. Phần F đã chỉ ra chi phí của giả định bậc hai sai: trên hàm $f(x) = x^2 - 0{,}1x^3$, mô hình bậc hai khớp từ ba điểm dự đoán đỉnh ở biên $x = 8$ với giá trị 46,4, trong khi đỉnh thật ở $x = 6{,}67$ với giá trị 14,81. Bài này dùng đúng hàm đó làm ví dụ chạy, để thấy BO xử lý tình huống RSM thất bại như thế nào.

## Phần B — Gaussian process: phân phối trên hàm

```definition[Gaussian process]
Một **Gaussian process** là một phân phối trên các hàm $f: X \to \mathbb{R}$ sao cho với mọi tập hữu hạn điểm $x_1, \ldots, x_n$, vector giá trị $(f(x_1), \ldots, f(x_n))$ là một vector ngẫu nhiên chuẩn nhiều chiều. Nó được xác định hoàn toàn bởi hàm trung bình $m(x) = \mathbb{E}[f(x)]$ và hàm hiệp phương sai (kernel) $k(x, x') = \mathrm{Cov}(f(x), f(x'))$. Thường lấy $m \equiv 0$ và đặt toàn bộ cấu trúc vào kernel.
```

```definition[Kernel bình phương mũ]
Kernel được dùng trong bài này là **bình phương mũ** (squared exponential / RBF):
$$k(x, x') = \sigma_f^2 \exp\!\left(-\frac{\|x - x'\|^2}{2\ell^2}\right).$$
Tham số $\ell$ là **độ dài tương quan**: hai điểm cách nhau khoảng $\ell$ có tương quan $e^{-1/2} \approx 0{,}61$, cách nhau $2\ell$ có tương quan $e^{-2} \approx 0{,}14$. Tham số $\sigma_f$ là biên độ — mức biến thiên điển hình của hàm. Kernel nói rằng hai điểm gần nhau thì giá trị tương quan; đây là cách GP mã hoá "hàm đáp ứng thì trơn", không cần biết dạng cụ thể.
```

```theorem[Hậu nghiệm của Gaussian process]
Cho quan sát $(X, y)$ với $y_i = f(x_i) + \varepsilon_i$, $\varepsilon_i \sim N(0, \sigma_n^2)$ độc lập. Với $K_{ij} = k(x_i, x_j)$, hậu nghiệm của $f$ tại điểm mới $x_*$ là chuẩn với
$$\mu(x_*) = k_*^\top (K + \sigma_n^2 I)^{-1} y, \qquad \sigma^2(x_*) = k(x_*, x_*) - k_*^\top (K + \sigma_n^2 I)^{-1} k_*,$$
trong đó $k_* = (k(x_*, x_1), \ldots, k(x_*, x_n))^\top$.

*Chứng minh.* Ghép $y$ và $f(x_*)$ thành một vector chuẩn nhiều chiều: hiệp phương sai giữa $y$ và $f(x_*)$ là $k_*$, giữa $y$ và $y$ là $K + \sigma_n^2 I$. Công thức trung bình có điều kiện của phân phối chuẩn nhiều chiều cho đúng hai biểu thức trên; công thức phương sai có điều kiện là bổ sung Schur của khối $k(x_*, x_*)$.
```

```example[Ba điểm tính tay]
Lấy đúng ba điểm đã dùng ở Phần F của bài chiết xuất: $(0, 0)$, $(1, 0{,}9)$, $(2, 3{,}2)$, kernel $\ell = 1$, $\sigma_f = 1$, không nhiễu. Ma trận kernel:
$$K = \begin{pmatrix} 1 & 0{,}607 & 0{,}135 \\ 0{,}607 & 1 & 0{,}607 \\ 0{,}135 & 0{,}607 & 1 \end{pmatrix}, \qquad K^{-1} \approx \begin{pmatrix} 1{,}83 & -1{,}52 & 0{,}67 \\ -1{,}52 & 2{,}84 & -1{,}52 \\ 0{,}67 & -1{,}52 & 1{,}83 \end{pmatrix}.$$
Tại $x_* = 3$, vector tương quan $k_* = (e^{-9/2}, e^{-2}, e^{-1/2}) \approx (0{,}011, 0{,}135, 0{,}607)$. Trung bình hậu nghiệm:
$$\mu(3) = k_*^\top K^{-1} y \approx 0{,}011 \cdot 0{,}78 + 0{,}135 \cdot (-2{,}31) + 0{,}607 \cdot 4{,}49 \approx 2{,}42,$$
và $\sigma(3) \approx 0{,}72$ (Hình 1). Tại $x_* = 6{,}67$, cách xa mọi điểm đo, tương quan gần bằng 0: $\mu \approx 0$, $\sigma \approx 1$ — GP trở về prior, không bịa ra giá trị. Đây là tính chất quyết định: **bất định $\sigma(x)$ lớn ở vùng chưa đo**, và chính bất định đó điều khiển việc thăm dò.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/gp-posterior.svg" alt="Hậu nghiệm GP từ ba điểm" style="display:block;width:100%;max-width:640px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Hậu nghiệm GP (ℓ = 1, σ_f = 1) từ ba điểm (0; 0), (1; 0,9), (2; 3,2). Đường teal là trung bình μ(x), dải mờ là μ ± 2σ; đường đứt xám là hàm thật. GP khớp chặt quanh dữ liệu, trở về prior (μ = 0, σ = 1) ở xa: tại x = 3, μ = 2,42, σ = 0,72.</figcaption></figure>

Lý thuyết đầy đủ về Gaussian process — kernel, hậu nghiệm, các lựa chọn thiết kế — ở Rasmussen và Williams [^1]; cách dùng GP làm surrogate cho thí nghiệm số từ bài gốc của Sacks et al. [^7].

## Phần C — Hàm thu thập và vòng lặp tối ưu

```definition[Vòng lặp tối ưu Bayes]
Tối ưu hoá Bayes là vòng lặp bốn bước. (1) Khớp GP trên các điểm đã đo. (2) Cực đại một **hàm thu thập** (acquisition function) $a(x)$ — một hàm rẻ, xây từ μ(x) và σ(x) — để chọn điểm hỏi tiếp theo. (3) Đo $f$ tại điểm đó, thêm vào dữ liệu. (4) Lặp cho tới khi cạn ngân sách hoặc đạt tiêu chuẩn dừng.
```

Hàm thu thập là nơi cân bằng **khai thác** (tìm quanh điểm tốt nhất đã biết, μ(x) cao) và **thăm dò** (tìm nơi σ(x) lớn, chưa được khám phá). Hai công thức phổ biến nhất đều có dạng đóng [^3] [^4].

```definition[Expected improvement]
Gọi $f^* = \max_i y_i$ là giá trị tốt nhất đã đo. **Expected improvement** tại $x$ là mức tăng kỳ vọng so với $f^*$:
$$\mathrm{EI}(x) = \mathbb{E}\big[\max(f(x) - f^*, 0)\big],$$
với kỳ vọng lấy theo hậu nghiệm $f(x) \sim N(\mu(x), \sigma^2(x))$. Đặt $Z = (\mu(x) - f^*)/\sigma(x)$, dạng đóng:
$$\mathrm{EI}(x) = (\mu(x) - f^*) \Phi(Z) + \sigma(x) \varphi(Z),$$
trong đó $\Phi$ là hàm phân phối tích luỹ và $\varphi$ là mật độ của chuẩn tắc.
```

```proof[Dạng đóng của EI]
Với $U \sim N(\mu, \sigma^2)$, đặt $Z = (U - f^*)/\sigma \sim N(0, 1)$. Khi $U \le f^*$ thì $\max(U - f^*, 0) = 0$. Khi $U > f^*$:
$$\mathbb{E}[(U - f^*)^+] = \int_{f^*}^\infty (u - f^*) \frac{1}{\sigma} \varphi\!\left(\frac{u - \mu}{\sigma}\right) du = \int_{-Z}^\infty (\mu + \sigma z - f^*) \varphi(z) dz.$$
Tách hai tích phân: $(\mu - f^*) \int_{-Z}^\infty \varphi(z)\,dz = (\mu - f^*)\Phi(Z)$, và $\sigma \int_{-Z}^\infty z\varphi(z)\,dz = \sigma\varphi(Z)$ vì $z\varphi(z) = -\varphi'(z)$. Cộng lại được dạng đóng.
```

Số hạng $(\mu - f^*)\Phi(Z)$ là phần khai thác: lớn khi trung bình hậu nghiệm vượt $f^*$. Số hạng $\sigma\varphi(Z)$ là phần thăm dò: lớn khi $\sigma$ lớn — ở vùng chưa đo, kể cả khi $\mu$ thấp. Điểm cực đại EI cân bằng hai lực này. Một lựa chọn đơn giản hơn là **upper confidence bound** $a(x) = \mu(x) + \kappa\sigma(x)$ với $\kappa > 0$ điều khiển mức thăm dò; EI có lợi thế là không có tham số tự do và có thang đo tự nhiên (đơn vị của $f$) [^5].

## Phần D — Ví dụ số: bài toán chiết xuất mở rộng

Áp dụng BO vào đúng hàm mà RSM bậc hai đã thất bại ở Phần F: $f(x) = x^2 - 0{,}1x^3$ trên $[0, 8]$, đỉnh thật tại $x^* = 20/3 \approx 6{,}67$, $f^* \approx 14{,}815$. Ba điểm khởi tạo $x = 0, 2, 4$ cho giá trị $0$; $3{,}2$; $9{,}6$ — chính là kiểu dữ liệu khởi động của một thiết kế thực nghiệm. Hyperparameter của GP: $\ell = 2$, $\sigma_f = 3$, $\sigma_n = 0{,}05$ (đo có nhiễu nhỏ). Các con số dưới đây là kết quả tính trực tiếp từ công thức hậu nghiệm và EI, không dùng thư viện.

```example[Năm vòng lặp trên hàm bậc ba]
Vòng 1: hậu nghiệm từ ba điểm khởi tạo. EI đạt cực đại $0{,}43$ tại $x = 4{,}69$ (Hình 2) — vùng này có $\mu$ cao và $\sigma$ chưa nhỏ, khai thác lẫn thăm dò đều hứa hẹn. Đo được $f(4{,}69) = 11{,}69 > 9{,}6$: kỷ lục cải thiện.

Vòng 2: điểm $x = 5{,}41$, $f = 13{,}44$. Vòng 3: $x = 6{,}10$, $f = 14{,}51$. Vòng 4: $x = 6{,}50$, $f = 14{,}79$. Vòng 5: $x = 6{,}68$, $f = 14{,}815$ — chạm đỉnh thật. Hình 3 so sánh hậu nghiệm sau khởi tạo (a) và sau 8 điểm (b): dải bất định quanh đỉnh thu hẹp, các điểm đo tụ về $x \approx 6{,}7$.
```

<figure style="margin:1.8em 0;"><img src="/img/opt/gp-acquisition.svg" alt="GP và hàm thu thập ở vòng 1" style="display:block;width:100%;max-width:640px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Vòng lặp 1. Trên: GP (ℓ = 2, σ_f = 3, σ_n = 0,05) sau ba điểm khởi tạo; đường đứt xám là hàm thật, đường ngang là kỷ lục f* = 9,6. Dưới: EI(x), cực đại 0,43 tại x = 4,69 — điểm hỏi của vòng này.</figcaption></figure>

<figure style="margin:1.8em 0;"><img src="/img/opt/gp-convergence.svg" alt="Hội tụ của BO về đỉnh" style="display:block;width:100%;max-width:840px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — (a) Sau 3 điểm khởi tạo: bất định lớn ở nửa phải, chưa có dấu hiệu đỉnh. (b) Sau 8 điểm (5 vòng lặp): các điểm đo tụ quanh x = 6,7, dải bất định thu hẹp về đỉnh thật (vòng tròn đỏ). Kỷ lục cuối: f* = 14,815.</figcaption></figure>

```remark[Vì sao BO thắng RSM ở bài toán này]
RSM bậc hai khớp từ ba điểm ở Phần F dự đoán đỉnh tại biên $x = 8$ với giá trị 46,4 — sai 13,6% so với đỉnh thật, và lời khuyên "càng lớn càng tốt" là sai hướng. BO không mắc lỗi này vì hai lý do. Thứ nhất, GP không giả định dạng hàm: kernel chỉ giả định độ trơn, và mọi dạng cong đều được biểu diễn qua hậu nghiệm. Thứ hai, EI tự động biết "chưa biết": ở vòng 1, σ(x) lớn tại $x > 5$ nên EI đẩy sang phải dù μ ở đó chưa cao; khi dữ liệu về đỉnh tích luỹ, σ quanh đỉnh nhỏ đi và các vòng sau chỉ tinh chỉnh. Đánh đổi khai thác–thăm dò là một phần của thuật toán, không phải quyết định của người dùng.
```

So sánh hai cách tiếp cận trên cùng bài toán:

| Tiêu chí | RSM bậc hai (Phần F) | BO + GP |
|---|---|---|
| Giả định về dạng hàm | đa thức bậc hai | không — chỉ độ trơn (kernel) |
| Dự đoán đỉnh | biên x = 8, giá trị 46,4 (sai) | x = 6,68, f* = 14,815 (đúng) |
| Thiết kế điểm đo | cố định từ trước | tuần tự, điểm sau phụ thuộc điểm trước |
| Thông tin về bất định | khoảng tin cậy của hệ số | σ(x) đầy đủ trên toàn miền |
| Ngân sách | phải chọn trước | dừng được sớm khi EI nhỏ |

## Phần E — Chọn hyperparameter và thực hành

```remark[Marginal likelihood và chọn độ dài tương quan]
GP có các tham số $\ell$, $\sigma_f$, $\sigma_n$ cần chọn. Cách chuẩn là cực đại **marginal likelihood** — xác suất của dữ liệu theo mô hình:
$$\log p(y \mid X) = -\frac{1}{2} y^\top (K + \sigma_n^2 I)^{-1} y - \frac{1}{2} \log|K + \sigma_n^2 I| - \frac{n}{2}\log 2\pi.$$
Số hạng đầu phạt mô hình khớp kém; số hạng giữa phạt mô hình quá phức tạp — đây là phiên bản tự động của nguyên tắc chọn mô hình. Số liệu trên ví dụ của bài nói lên một bài học quan trọng. Với ba điểm khởi tạo, marginal likelihood ưu $\ell = 0{,}5$ ($-7{,}97$) hơn $\ell = 1$ ($-8{,}37$) và $\ell = 2$ ($-9{,}12$): dữ liệu ít thì nó chọn độ trơn quá nhỏ, GP nhiễu loạn và khớp cả nhiễu. Khi dữ liệu tăng, lựa chọn dịch về đúng độ trơn của hàm: với 5 điểm, ưu $\ell = 1{,}5$; với 8 điểm, ưu $\ell = 2{,}0$ ($-118{,}1$ so với $-140{,}7$ cho $\ell = 1{,}5$). Hình 4 cho thấy ba mức $\ell$ trên cùng ba điểm. Hệ quả thực hành: không tin marginal likelihood khi dữ liệu còn ít, và nên tái ước lượng hyperparameter định kỳ trong vòng lặp.
```

Việc ước lượng hyperparameter trong vòng lặp thực nghiệm thảo luận ở Snoek, Larochelle và Adams [^6].

<figure style="margin:1.8em 0;"><img src="/img/opt/gp-lengthscale.svg" alt="Ảnh hưởng của độ dài tương quan" style="display:block;width:100%;max-width:840px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Cùng ba điểm, ba độ dài tương quan. ℓ = 0,5: GP nhiễu loạn, tin vào từng điểm và trở về prior ngay giữa các điểm. ℓ = 2,0: trơn vừa, khớp xu hướng. ℓ = 4,0: quá trơn, mất cấu trúc cục bộ. Với 3 điểm, marginal likelihood ưu ℓ = 0,5 (log ML = −7,97) — dữ liệu ít thì lựa chọn này không đáng tin; với 8 điểm nó hội tụ về ℓ = 2,0.</figcaption></figure>

```remark[Thực hành trong phòng thí nghiệm]
Ba quy tắc chuyển từ ví dụ sang bài toán thật. Thứ nhất, giới hạn miền: ràng buộc an toàn (nhiệt độ không quá 75 °C, ngân sách thời gian) được áp bằng cách cực đại acquisition function trên miền khả thi — GP không cần biết ràng buộc, chỉ cần không đề xuất điểm ngoài miền. Thứ hai, nhiễu đo: ước lượng $\sigma_n$ từ replicate tại tâm trước khi chạy; nếu ước lượng quá nhỏ, GP tin vào điểm nhiễu và thăm dò sai chỗ. Thứ ba, tiêu chuẩn dừng: dừng khi EI dưới một ngưỡng tính bằng đơn vị của $f$ (ví dụ 0,05 mg/g) hoặc khi hết ngân sách; kết thúc bằng xác nhận thực nghiệm hai giai đoạn như Phần D của bài chiết xuất.
```

Quy trình xác nhận hai giai đoạn và khung bề mặt đáp ứng ở Box–Wilson [^8] và Myers, Montgomery và Anderson-Cook [^9].

```remark[Cạm bẫy]
Bốn lỗi thường gặp. Thứ nhất, số chiều cao: EI cực đại trên lưới trở nên đắt và hiệu quả thăm dò giảm nhanh khi số biến vượt quá khoảng mười — BO là công cụ cho ít biến, đắt tiền, không phải cho bài toán hàng trăm biến. Thứ hai, kernel sai loại: kernel bình phương mũ quá trơn cho hàm có bước nhảy hoặc nhiễu gián đoạn; kernel Matern với độ trơn hữu hạn an toàn hơn trong thực nghiệm hoá học. Thứ ba, acquisition đa cực trị: EI thường có nhiều đỉnh, phải cực đại bằng nhiều điểm khởi đầu hoặc lưới dày. Thứ tư, quên ngân sách: BO không bảo đảm hội tụ trong một số vòng cố định — nó chỉ chọn điểm tốt nhất có thể cho từng vòng; ngân sách phải được lên kế hoạch trước, và kỷ lục $f^*$ sau mỗi vòng mới là con số báo cáo, không phải điểm cuối cùng.
```

Lựa chọn kernel và ảnh hưởng của nó lên hậu nghiệm trình bày ở Rasmussen–Williams [^1].

## Lộ trình tiếp theo

Bài này nối trực tiếp với Phần F của bài *Tối ưu hoá điều kiện chiết xuất dược liệu*: đó là lời giải phi tham số khi xấp xỉ bậc hai không đủ. Với người đọc muốn đi sâu: lý thuyết GP và các lựa chọn kernel ở Rasmussen–Williams [^1]; khảo sát toàn diện các hàm thu thập và biến thể ở Shahriari et al. [^2]; hướng dẫn thực hành có thảo luận về ràng buộc và dừng sớm ở Frazier [^5]; việc ước lượng hyperparameter thực dụng từ hồ sơ các bài toán machine learning ở Snoek et al. [^6]. Các mở rộng tự nhiên: đo nhiều mẫu mỗi vòng (batch BO), kết hợp mô hình đa độ chính xác (multi-fidelity), và nhiều mục tiêu cùng lúc — hiệu suất flavonoid và hàm lượng tạp trong bài chiết xuất là một ví dụ sẵn có.

[^1]: C. E. Rasmussen and C. K. I. Williams, *Gaussian Processes for Machine Learning*, MIT Press, 2006.
[^2]: B. Shahriari, K. Swersky, Z. Wang, R. P. Adams and N. de Freitas, "Taking the Human Out of the Loop: A Review of Bayesian Optimization," *Proceedings of the IEEE* 104(1): 148–175, 2016.
[^3]: J. Mockus, "On Bayesian Methods for Seeking the Extremum," *Proceedings of the IFIP Technical Conference*, 1975.
[^4]: D. R. Jones, M. Schonlau and W. J. Welch, "Efficient Global Optimization of Expensive Black-Box Functions," *Journal of Global Optimization* 13(4): 455–492, 1998.
[^5]: P. I. Frazier, "A Tutorial on Bayesian Optimization," arXiv:1807.02811, 2018.
[^6]: J. Snoek, H. Larochelle and R. P. Adams, "Practical Bayesian Optimization of Machine Learning Algorithms," *Advances in Neural Information Processing Systems* 25, 2012.
[^7]: J. Sacks, W. J. Welch, T. J. Mitchell and H. P. Wynn, "Design and Analysis of Computer Experiments," *Statistical Science* 4(4): 409–423, 1989.
[^8]: G. E. P. Box and K. B. Wilson, "On the experimental attainment of optimum conditions," *Journal of the Royal Statistical Society B* 13(1): 1–45, 1951.
[^9]: R. H. Myers, D. C. Montgomery and C. M. Anderson-Cook, *Response Surface Methodology*, 4th ed., Wiley, 2016.
