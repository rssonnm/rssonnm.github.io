---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 11: Giảm chiều và wavelet — PCA và khử nhiễu trên dữ liệu phổ"
date: 2026-08-11T04:00:00
description: "Phần 10 đã xử lý từng tín hiệu một. Nhưng một thí nghiệm hiện đại thường sản sinh hàng nghìn tín hiệu cùng lúc: mỗi mẫu cho một phổ với hàng trăm đến hàng nghìn điểm đo — và những điểm này tương quan chặt chẽ. Đây là dữ liệu đa biến (multivariate), nơi hồi quy cổ điển sụp đổ vì đa cộng tuyến. Bài viết này xây dựng hai công cụ cuối của series: phân tích thành phần chính (PCA) — tìm các trục phương sai lớn nhất để nén ma trận phổ thành vài thành phần (với ví dụ tính tay 2 chiều, scree plot cho hỗn hợp UV-Vis hai chất, hồi quy thành phần chính PCR cho NIR khi OLS suy biến, phát hiện ngoại lai bằng Q-residual); và biến đổi wavelet — kính hiển vi thời gian–tần số thích ứng, với DWT Haar tính tay và định lý Parseval, khử nhiễu bằng ngưỡng hệ số (universal threshold) với so sánh trung thực Savitzky–Golay trên tín hiệu nhảy bậc và đỉnh trơn."
topic: mathematics
tags: [statistics, pca, principal-component-analysis, wavelet, chemometrics, multivariate-analysis, denoising, tutorial]
featured: false
draft: false
---

Mười phần trước xử lý dữ liệu **một chiều**: mỗi đơn vị đo cho một con số (nồng độ, thời gian, độ hấp thụ tại một bước sóng), và mọi công cụ đều quy về trung bình, phương sai, so sánh, hồi quy trên vài biến. Nhưng hãy nhìn vào dữ liệu một thí nghiệm quang phổ thực sự: mỗi mẫu cho một **phổ** — hàng trăm đến hàng nghìn điểm đo theo bước sóng. Một bộ 20 mẫu NIR là một **ma trận** $20 \times 1000$ số. Đây là dữ liệu **đa biến (multivariate)**, và nó đặt ra hai câu hỏi mới:

1. **Làm sao nén** ma trận phổ thành vài con số có nghĩa mà không mất thông tin? → **PCA (phân tích thành phần chính)**.
2. **Làm sao làm sạch** từng tín hiệu khi nhiễu và tín hiệu đan xen, đặc biệt khi tín hiệu có cấu trúc nhảy bậc (baseline bậc thang, spike)? → **biến đổi wavelet**.

Hai công cụ này — cùng với hồi quy thành phần chính (PCR) — là cầu nối cuối cùng của series sang machine learning cho hoá học.

## Phần A — Dữ liệu phổ là dữ liệu đa biến

```definition[Ma trận dữ liệu phổ]
Gom $n$ mẫu, mỗi mẫu một phổ gồm $p$ điểm đo (bước sóng, thời gian lưu, số sóng), ta có ma trận:
$$X = \begin{pmatrix} x_{11} & x_{12} & \cdots & x_{1p} \\ \vdots & & & \vdots \\ x_{n1} & x_{n2} & \cdots & x_{np} \end{pmatrix},$$
mỗi hàng là một phổ, mỗi cột là một "biến". Với quang phổ, thường $p \gg n$: 20 mẫu × 1000 bước sóng là chuyện thường. Các cột **không độc lập**: độ hấp thụ tại bước sóng 500 nm và 502 nm gần như trùng nhau.
```

```remark[Vấn đề đa cộng tuyến]
Chính sự tương quan đó giết chết hồi quy cổ điển. Nhớ lại Phần 6: ma trận $X^\top X$ phải khả nghịch để có $\hat\beta = (X^\top X)^{-1}X^\top y$. Khi $p > n$ (hoặc các cột phụ thuộc tuyến tính gần như chắc chắn), $X^\top X$ **suy biến** — không có lời giải duy nhất. Ngay cả khi khả nghịch, phương sai của $\hat\beta$ phình to (VIF của Phần 6). Với phổ NIR giả lập $20 \times 50$ mà ta dùng ở Phần D, $X^\top X$ là ma trận $50\times50$ hạng 3: **OLS không giải được**. Cần một cách khác: giảm chiều trước, hồi quy sau.
```

## Phần B — PCA: từ hình học đến đại số

Ý tưởng của PCA [^1][^2] — và bản tổng quan hiện đại của Jolliffe–Cadima [^3] — xuất phát từ một quan sát hình học. Đám mây $n$ điểm trong không gian $p$ chiều thường **bẹt**: nó nằm gần một không gian con có số chiều nhỏ hơn nhiều. Trong ví dụ 5 điểm 2 chiều ở Hình 1, dữ liệu kéo dài theo một hướng nghiêng — hướng đó mang 92,5% toàn bộ phương sai.

<figure style="margin:1.8em 0;"><img src="/img/stats/pca-geometry.svg" alt="Hình học PCA trên 5 điểm 2 chiều" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — PCA trên 5 điểm (1,2),(2,3),(3,3),(4,5),(5,4). Trục PC1 (đỏ) là hướng phương sai lớn nhất: hình chiếu vuông góc của các điểm lên nó (chấm đỏ) dàn trải nhất có thể. PC2 (xanh) vuông góc với PC1, giữ phần phương sai còn lại. Ellipse minh hoạ phân bố dữ liệu.</figcaption></figure>

```definition[Thành phần chính]
Thành phần chính thứ nhất là vector đơn vị $w_1$ cực đại hoá phương sai của hình chiếu: $w_1 = \arg\max_{w:\, \|w\|=1} \operatorname{Var}(Xw)$. Thành phần thứ $k$ cực đại hoá phương sai trong số các vector đơn vị **trực giao** với $w_1, \ldots, w_{k-1}$. Giá trị $t_{ik} = x_i \cdot w_k$ gọi là **score** của mẫu $i$ trên PC $k$; vector $w_k$ (hệ số theo từng biến gốc) gọi là **loading**.
```

```theorem[PC là vector riêng của ma trận hiệp phương sai]
Gọi $S = \frac{1}{n-1} X_c^\top X_c$ là ma trận hiệp phương sai của dữ liệu đã trừ trung bình. Các thành phần chính chính là các **vector riêng** của $S$, và phương sai của score thứ $k$ đúng bằng trị riêng $\lambda_k$ tương ứng. Phương sai tổng được bảo toàn: $\sum_k \lambda_k = \operatorname{tr}(S)$.

*Phác thảo chứng minh.* Cực đại hoá $w^\top S w$ với ràng buộc $w^\top w = 1$. Dùng nhân tử Lagrange: $L = w^\top S w - \lambda(w^\top w - 1)$. Lấy đạo hàm theo $w$:
$$\frac{\partial L}{\partial w} = 2Sw - 2\lambda w = 0 \;\Longrightarrow\; Sw = \lambda w.$$
Vậy điểm dừng là vector riêng của $S$; với vector riêng chuẩn hoá, $w^\top S w = \lambda$ đúng là phương sai của hình chiếu. Cực đại toàn cục rơi vào trị riêng lớn nhất, và do $S$ đối xứng, các vector riêng ứng với trị riêng khác nhau trực giao — đúng yêu cầu của PCA. $\blacksquare$
```

```lemma[Phân rã SVD và phương sai giải thích]
Ma trận dữ liệu đã chuẩn hoá phân rã được thành $X_c = U\Sigma V^\top$ (SVD): $V$ chứa các loading, $U\Sigma$ chứa các score, $\Sigma = \operatorname{diag}(\sqrt{\lambda_1}, \ldots)$. **Phương sai giải thích** bởi $k$ thành phần đầu là $\sum_{j\le k}\lambda_j / \sum_j \lambda_j$ — con số này cho biết bao nhiêu phần trăm thông tin dữ liệu được giữ lại khi cắt còn $k$ chiều.
```

```example[PCA bằng tay trên 5 điểm]
Dữ liệu: (1,2), (2,3), (3,3), (4,5), (5,4). Trừ trung bình $(\bar x, \bar y) = (3{,}0;\, 3{,}4)$ rồi tính ma trận hiệp phương sai (chia $n-1 = 4$):
$$S = \begin{pmatrix} 2{,}50 & 1{,}50 \\ 1{,}50 & 1{,}30 \end{pmatrix}, \qquad \operatorname{tr} S = 3{,}80,\ \det S = 1{,}00.$$
Trị riêng của ma trận $2\times2$: $\lambda = \frac{\operatorname{tr} \pm \sqrt{\operatorname{tr}^2 - 4\det}}{2} = \frac{3{,}80 \pm \sqrt{10{,}44}}{2}$:
$$\lambda_1 = 3{,}5155,\qquad \lambda_2 = 0{,}2845,\qquad \text{PC1 giải thích } \frac{3{,}5155}{3{,}80} = 92{,}5\%.$$
Vector riêng của $\lambda_1$: $(2{,}50 - 3{,}5155)v_1 + 1{,}50\,v_2 = 0 \Rightarrow v_2 = 0{,}677\,v_1$, chuẩn hoá được $w_1 = (0{,}828;\, 0{,}560)$ — hướng nghiêng 34,1° so với trục $x$, đúng như Hình 1. Một chiều (PC1) đã nắm 92,5% thông tin của hai chiều.
```

```remark[Center và scale]
PCA bắt đầu bằng việc trừ trung bình từng cột (center). Câu hỏi quan trọng: có **chia cho độ lệch chuẩn từng cột** (scale) không? Nếu các biến cùng đơn vị — ví dụ độ hấp thụ tại các bước sóng — thì không cần scale: phổ ở bước sóng có tín hiệu mạnh đáng được nặng hơn. Nếu các biến khác đơn vị (nồng độ, pH, nhiệt độ trộn chung), bắt buộc scale về phương sai đơn vị, nếu không biến có số lớn sẽ thống trị. Đây là quyết định đầu tiên của mọi phân tích PCA và phải được báo cáo.
```

```example[Scree plot: hỗn hợp UV-Vis hai chất]
Mười hai phổ UV-Vis (200–800 nm) của các hỗn hợp với tỉ lệ khác nhau giữa hai chất hấp thụ (đỉnh ở 400 và 560 nm), cộng nhiễu nhỏ. PCA cho trị riêng:
$$\lambda_1 = 0{,}7448,\quad \lambda_2 = 0{,}2129,\quad \lambda_3 \approx \lambda_4 \approx \cdots \approx 0.$$
Hai thành phần đầu giải thích **99,99%** phương sai — đúng bằng số chất hấp thụ trong hỗn hợp. Scree plot (Hình 2) cho thấy "gấp khúc" (elbow) rơi mạnh sau PC2: đó là dấu hiệu chọn số thành phần. Về mặt vật lý, mỗi mẫu là tổ hợp tuyến tính của 2 phổ thành phần (định luật Beer–Lambert cộng tuyến tính), nên toàn bộ dữ liệu chỉ sống trong một không gian con 2 chiều — PCA tìm ra đúng không gian đó.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/pca-spectra.svg" alt="PCA trên hỗn hợp UV-Vis hai chất" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — (a) 12 phổ hỗn hợp hai chất: chồng chéo, khó đọc trực tiếp. (b) Scree plot: trị riêng λ₁ = 0,74 và λ₂ = 0,21 vượt trội, các trị riêng còn lại ~ 0; đường tích luỹ (vàng) chạm 99,99% sau 2 thành phần. Số chất hấp thụ = số thành phần chính có nghĩa.</figcaption></figure>

## Phần C — Wavelet: kính hiển vi thời gian–tần số

Phần 10 đã chỉ ra điểm mù của Fourier: biến đổi Fourier cho biết **có những tần số nào**, nhưng không biết **chúng xuất hiện ở đâu theo thời gian**. Một vạch phổ đột biến giữa baseline bậc thang — ví dụ một xung nhiễu máy — đóng góp vào mọi hệ số Fourier một chút, không thể tách riêng. **Biến đổi wavelet** [^4] sửa điều này bằng cách dùng các "sóng nhỏ" (wavelets) cục bộ cả về thời gian lẫn tần số, với độ phân giải tự điều chỉnh.

<figure style="margin:1.8em 0;"><img src="/img/stats/wavelet-heisenberg.svg" alt="Ô Heisenberg: Fourier, STFT, wavelet" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Ba cách chia mặt phẳng thời gian–tần số. Fourier (a): một ô trải toàn bộ thời gian — biết chính xác tần số, mù về thời điểm. STFT (b): lưới ô đều — độ phân giải cố định ở mọi nơi. Wavelet (c): ô tự điều chỉnh — tần số cao nhìn qua cửa sổ thời gian ngắn, tần số thấp nhìn lâu hơn. Diện tích mỗi ô không đổi (bất định Δt·Δf ≥ 1/4π của Phần 10), wavelet chỉ phân bổ lại theo nhu cầu của tín hiệu.</figcaption></figure>

```definition[Biến đổi wavelet liên tục]
Chọn một **wavelet mẹ** $\psi(t)$ — một dao động cục bộ, tổng bằng 0 (ví dụ: Haar — một bậc nhảy lên rồi xuống; Morlet — một gói sóng hình sin nhân Gauss). Biến đổi wavelet của $x(t)$:
$$W(a, b) = \frac{1}{\sqrt{a}} \int x(t)\, \psi\!\Bigl(\frac{t - b}{a}\Bigr)\, dt,$$
với $a$ là **thang (scale)** — tỉ lệ nghịch với tần số — và $b$ là **vị trí thời gian**. Hệ số $W(a,b)$ lớn nghĩa là tín hiệu có dạng giống $\psi$ phóng to với thang $a$ tại thời điểm $b$.
```

```definition[DWT: biến đổi wavelet rời rạc và lọc ngân hàng]
Với dữ liệu rời rạc $N$ mẫu, biến đổi wavelet rời rạc (DWT) thực hiện như một **ngân hàng lọc** (thuật toán Mallat): ở mỗi mức, tín hiệu tách thành phần **xấp xỉ** (trung bình lân cận — thông thấp) và phần **chi tiết** (hiệu lân cận — thông cao), rồi giảm mẫu đi một nửa. Với wavelet Haar (nhân $\sqrt{2}$ để bảo toàn năng lượng):
$$\text{xấp xỉ: } a_k = \frac{x_{2k} + x_{2k+1}}{\sqrt{2}}, \qquad \text{chi tiết: } d_k = \frac{x_{2k} - x_{2k+1}}{\sqrt{2}}.$$
Sau $J = \log_2 N$ mức, tín hiệu được biểu diễn bởi $N$ hệ số: một hệ số xấp xỉ cuối cùng + $N-1$ hệ số chi tiết ở các mức.
```

```example[Haar DWT bằng tay: Parseval và nén]
Tín hiệu 8 mẫu $x = (4,\, 6,\, 10,\, 12,\, 8,\, 6,\, 5,\, 5)$. Áp dụng công thức trên qua 3 mức:
- Mức 1: $a = (7{,}07;\, 15{,}56;\, 9{,}90;\, 7{,}07)$, $d = (-1{,}41;\, -1{,}41;\, 1{,}41;\, 0)$
- Mức 2: $a = (16{,}0;\, 12{,}0)$, $d = (-6{,}0;\, 2{,}0)$
- Mức 3: $a = (19{,}8)$, $d = (2{,}83)$

Toàn bộ hệ số: $(19{,}8;\ 2{,}83;\ -6{,}0;\ 2{,}0;\ -1{,}41;\ -1{,}41;\ 1{,}41;\ 0)$. Kiểm tra **Parseval** (Phần 10): $\sum x_n^2 = 16+36+100+144+64+36+25+25 = 446$, và $19{,}8^2 + 2{,}83^2 + (-6)^2 + 2^2 + 2\cdot1{,}41^2 + 0 = 446$. Năng lượng bảo toàn trọn vẹn.

Bây giờ đặt ngưỡng: giữ lại hệ số $|c| \ge 2{,}5$. Còn **3 trong 8 hệ số** $(19{,}8;\ 2{,}83;\ -6{,}0)$ — tín hiệu gốc là tổng của một hằng số, một bước nhảy và một bước nhảy nữa ở thang lớn; các hệ số nhỏ là nhiễu hoặc chi tiết không đáng kể. Đây là bản chất của **nén**: phần lớn hệ số wavelet gần bằng 0, năng lượng dồn vào ít hệ số lớn.
```

Quy trình khử nhiễu bằng ngưỡng — *wavelet shrinkage* — do Donoho và Johnstone đề xuất [^5]:

```definition[Khử nhiễu bằng ngưỡng hệ số]
Quy trình gồm 3 bước: (1) DWT tín hiệu; (2) ước lượng nhiễu $\hat\sigma$ từ độ lệch tuyệt đối trung vị (MAD) của hệ số chi tiết mức mịn nhất: $\hat\sigma = \operatorname{median}(|d_1|)/0{,}6745$, rồi đặt **ngưỡng vạn năng** $T = \hat\sigma\sqrt{2\ln N}$; (3) co hệ số về 0 theo **ngưỡng mềm**: $c \mapsto \operatorname{sign}(c)\max(|c| - T,\, 0)$ (chỉ áp lên hệ số chi tiết, giữ nguyên xấp xỉ), rồi DWT ngược. Nhiễu trắng phân tán đều vào mọi hệ số với biên độ ~$\hat\sigma$; tín hiệu dồn vào ít hệ số lớn — ngưỡng cắt nhiễu mà giữ tín hiệu.
```

```example[Khử nhiễu tín hiệu nhảy bậc: wavelet thắng áp đảo]
Tín hiệu mô phỏng một baseline bậc thang của máy đo (các mức 0 → 1 → 0,5 → 0 → 1,5 → 0,5 → 0 → 2) cộng nhiễu trắng $\sigma = 0{,}05$, $N = 128$ mẫu. MAD ước lượng $\hat\sigma = 0{,}044$, ngưỡng $T = 0{,}138$:
$$\text{MSE: thô } 0{,}00238 \;\to\; \text{wavelet } 0{,}00099\ (SNR \times 1{,}55),$$
chỉ **7 trong 128** hệ số được giữ; sai số cực đại tại các bậc nhảy chỉ 0,052. Đối chứng Savitzky–Golay-5 (Phần 10): MSE **0,0735** — tệ hơn cả tín hiệu thô! Lý do: SG làm trơn bằng đa thức trong cửa sổ, làm tròn mọi bậc nhảy (sai số đến 0,53 tại bậc nhảy). Wavelet biểu diễn bậc nhảy bằng ít hệ số lớn nên giữ chúng sắc nét.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/wavelet-denoise.svg" alt="Khử nhiễu wavelet tín hiệu nhảy bậc" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — (a) Tín hiệu nhảy bậc + nhiễu (xám) và tín hiệu thật (vàng). (b) Sau khử nhiễu wavelet: các bậc nhảy được giữ sắc nét, nhiễu biến mất — MSE giảm từ 0,00238 xuống 0,00099 với 7/128 hệ số. Trái lại, làm trơn Savitzky–Golay làm bẹt các bậc nhảy (MSE 0,0735).</figcaption></figure>

```remark[Trung thực về giới hạn: đỉnh trơn thì SG-5 thắng]
Với tín hiệu **đỉnh trơn** (Gauss) như ví dụ sắc ký ở Phần 10, kết quả ngược lại: trên cùng mức nhiễu $\sigma = 0{,}05$, MSE của SG-5 là 0,00102 — tốt hơn tín hiệu thô (0,00238) và tốt hơn hẳn Haar wavelet (0,00823). Vì sao? Đỉnh trơn không "thưa" trong cơ sở Haar (cần nhiều bậc nhảy nhỏ để vẽ đường cong), nên ngưỡng cắt cả tín hiệu lẫn nhiễu; còn SG-5 khớp đa thức thì lại rất hợp đường trơn. **Bài học: chọn công cụ theo cấu trúc tín hiệu** — nhảy bậc, spike, baseline bậc thang → wavelet; đỉnh trơn, phổ liên tục → SG. Không có công cụ nào thắng mọi nơi.
```

## Phần D — Ứng dụng: PCR, phát hiện ngoại lai, wavelet trong hoá phân tích

```example[PCR: hồi quy thành phần chính cho phổ NIR]
Hai mươi mẫu, mỗi mẫu một phổ NIR 50 bước sóng (900–998 nm) — thực chất tổ hợp của 2 chất với nhiễu nhỏ; nồng độ đích $y$ phụ thuộc tuyến tính vào 2 thành phần ẩn. Kiểm tra OLS: ma trận $X^\top X$ ($50\times50$, hạng 3) **không khả nghịch** — không giải được. PCR: (1) PCA trên ma trận phổ, (2) hồi quy $y$ trên $k$ score đầu:
$$k = 1:\ R^2 = 0{,}944,\qquad k = 2:\ R^2 = 0{,}999,\ \text{RMSE} = 0{,}033,\qquad k = 3:\ R^2 = 0{,}999.$$
Hai thành phần đủ để đạt $R^2 \approx 0{,}999$: PC1 và PC2 mang đúng thông tin của 2 chất; thêm PC3 không giúp gì. Đây là mẫu hình của **định lượng quang phổ hiện đại** (chemometrics): giảm chiều để thoát đa cộng tuyến, hồi quy trên vài biến sạch thay vì hàng nghìn bước sóng tương quan.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/pcr.svg" alt="PCR dự đoán nồng độ từ phổ NIR" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 5 — (a) 20 phổ NIR gần như trùng nhau về hình dạng, chỉ khác tỉ lệ hai thành phần — đa cộng tuyến cực mạnh. (b) Dự đoán nồng độ bằng PCR với k = 2: các điểm nằm sát đường y = x, R² = 0,999. OLS trên 50 bước sóng không giải được (XᵀX suy biến).</figcaption></figure>

```remark[Đọc PC như "phổ trừu tượng"]
Trong hoá học phân tích, các loading của PCA trên dữ liệu hỗn hợp có một ý nghĩa đặc biệt: chúng là các "phổ trừu tượng" (abstract factors) [^6] — tổ hợp tuyến tính của phổ các chất thật. Chúng **không phải** phổ của từng chất (chỉ là một cơ sở trực giao của không gian phổ), nhưng số thành phần có nghĩa cho ta biết **số chất hấp thụ độc lập** trong hỗn hợp — và bằng cách xoay cơ sở (rotation), các phương pháp như phân giải đường cong đa biến (MCR) có thể khôi phục phổ gần thật của từng thành phần. Từ PCA, khoá học dữ liệu quang phổ chuyển thành bài toán tìm cơ sở có ý nghĩa vật lý.
```

```example[Phát hiện ngoại lai bằng Q-residual]
Sau khi giữ $k$ thành phần, mỗi mẫu có thể được **dựng lại** gần đúng từ score: $\hat x_i = \sum_{j\le k} t_{ij} w_j$. Mẫu khớp tốt với mô hình thì phần dư nhỏ; mẫu ngoại lai — nhiễu bẩn, spike, mẫu khác loại — có phần dư lớn:
$$Q_i = \|x_i - \hat x_i\|^2.$$
Với dữ liệu NIR ở trên ($k = 2$), các mẫu bình thường có $Q$ tối đa 0,0118 (trung bình 0,0042). Thêm một mẫu có spike đơn tại một bước sóng: $Q = 0{,}704$ — **gấp 60 lần** mức bình thường. Biểu đồ $Q$ theo Hotelling $T^2$ (khoảng cách của score tới tâm) là bộ đôi chuẩn để soi ngoại lai trong chemometrics [^7]: $T^2$ bắt mẫu lệch trong mô hình, $Q$ bắt mẫu không thuộc mô hình.
```

```example[Wavelet trong phòng thí nghiệm]
Ba ứng dụng thực tế của wavelet trong hoá-sinh: (1) **loại spike tia vũ trụ** trong phổ CCD — mỗi spike là một xung hẹp, tạo hệ số wavelet lớn ở mức mịn: đặt ngưỡng ở đúng mức đó mà không đụng tới đỉnh phổ rộng (điều mà SG-5 không làm được, như đã thấy); (2) **phát hiện đỉnh sắc ký tự động** — quét CWT theo nhiều thang, đỉnh thật xuất hiện ở nhiều thang liên tiếp còn nhiễu chỉ ở thang mịn; (3) **nén dữ liệu phổ** — giữ vài phần trăm hệ số lớn nhất rồi dựng lại (chuẩn JPEG2000 dùng chính ý tưởng này), phù hợp lưu trữ thư viện phổ khổng lồ.
```

## Cạm bẫy thực hành

1. **Quyết định scale trước khi chạy.** Không scale khi các biến cùng đơn vị (phổ); bắt buộc scale khi trộn đơn vị khác nhau. Scale khác nhau → PCA khác nhau hoàn toàn.
2. **Quá nhiều thành phần = overfit.** Giữ $k$ lớn để "vừa vặn" dữ liệu huấn luyện sẽ bắt cả nhiễu. Chọn $k$ bằng scree plot + xác nhận chéo (cross-validation), không phải bằng $R^2$ huấn luyện.
3. **Leakage trong xác nhận chéo.** Nếu tính PCA trên **toàn bộ** dữ liệu rồi mới tách train/test, thông tin từ test đã lọt vào mô hình — $R^2$ lạc quan giả tạo. Phải fit PCA trên train và chiếu test qua cùng phép biến đổi.
4. **PC không phải phổ thật.** Loading là cơ sở trừu tượng; đừng diễn giải từng loading như phổ của một chất trừ khi dùng rotation (MCR) và kiểm chứng.
5. **Ngưỡng wavelet mù.** Ngưỡng vạn năng $\sigma\sqrt{2\ln N}$ hơi mạnh tay (triệt cả tín hiệu yếu); ngưỡng mềm hơn theo mức (level-dependent) thường tốt hơn. Và nhớ: wavelet thắng trên tín hiệu nhảy bậc, SG thắng trên đỉnh trơn — chọn theo cấu trúc.
6. **Báo cáo thiếu số.** Luôn nêu: đã center/scale chưa, $k$ chọn thế nào, bao nhiêu phần trăm phương sai giải thích, và kết quả xác nhận chéo — không chỉ $R^2$ huấn luyện.

## Kết thúc series: lộ trình tiếp theo

Mười một phần đã đi một hành trình trọn vẹn: từ mô tả dữ liệu (1), xác suất và biến ngẫu nhiên (2), phân phối mẫu và định lý giới hạn trung tâm (3), lan truyền sai số (4), kiểm định giả thuyết và $t$-test (5), hồi quy và ANOVA (6), GLM (7), mô hình hỗn hợp (8), dữ liệu dọc và sống sót (9), chuỗi thời gian và Fourier (10), và giờ là PCA–wavelet–chemometrics (11). PCA và PCR là bước chân đầu tiên vào machine learning cho hoá-sinh. Để đi tiếp: (1) **PLS** (partial least squares) — biến thể của PCR dùng cả thông tin $y$ khi chọn hướng, thường vượt PCR cho dữ liệu nhiễu; (2) sách Brereton [^7] cho chemometrics và Malinowski [^6] cho phân tích nhân tố hoá học; (3) Mallat [^4] cho wavelet trình độ sâu; (4) random forest và mạng nơ-ron cho dữ liệu phổ — nơi PCA thường là tầng tiền xử lý đầu tiên; (5) diễn giải mô hình (interpretability) — thứ mà các nhà hoá học cần hơn bất kỳ độ chính xác nào.

[^1]: K. Pearson, "On lines and planes of closest fit to systems of points in space," *Philosophical Magazine* 2(11): 559–572, 1901.
[^2]: H. Hotelling, "Analysis of a complex of statistical variables into principal components," *Journal of Educational Psychology* 24(6): 417–441, 1933.
[^3]: I. T. Jolliffe and J. Cadima, "Principal component analysis: a review and recent developments," *Philosophical Transactions of the Royal Society A* 374: 20150202, 2016.
[^4]: S. Mallat, *A Wavelet Tour of Signal Processing*, 3rd ed., Academic Press, 2009.
[^5]: D. L. Donoho and I. M. Johnstone, "Ideal spatial adaptation by wavelet shrinkage," *Biometrika* 81(3): 425–455, 1994.
[^6]: E. R. Malinowski, *Factor Analysis in Chemistry*, 3rd ed., Wiley, 2002.
[^7]: R. G. Brereton, *Chemometrics: Data Driven Extraction for Science*, 2nd ed., Wiley, 2018.
