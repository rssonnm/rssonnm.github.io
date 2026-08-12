---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 5: Kiểm định giả thuyết, t-test và ANOVA"
date: 2026-08-10T16:00:00
description: "Phần 1 đã cho công thức chạy kiểm định; phần này giải thích vì sao chúng hoạt động. Bài viết xây kiểm định giả thuyết từ gốc: p-value là một biến ngẫu nhiên có phân phối đều dưới H₀, bổ đề Neyman–Pearson giải thích vì sao thống kê kiểm định có dạng tỉ số tín hiệu/nhiễu, công suất là xác suất bác bỏ H₀ khi H₁ đúng. Rồi dùng khung phân phối mẫu + trục xoay của Phần 3 để chứng minh phân phối t (tỉ số của chuẩn tắc và căn χ²/ν, định lý Cochran), phân phối F của ANOVA (phân rã tổng bình phương), Welch, Tukey HSD — kèm ví dụ tính tay và cảnh báo p-hacking bằng mô phỏng."
topic: mathematics
tags: [statistics, hypothesis-testing, p-value, t-test, anova, power, tutorial]
featured: false
draft: false
---

Phần 1 đã trang bị đủ công thức để *chạy* một kiểm định: tính t, so với giá trị tới hạn, đọc p-value, chọn t-test hay ANOVA. Phần này trả lời câu hỏi sâu hơn: **vì sao cỗ máy đó hoạt động?** Vì sao p-value là một con số có nghĩa, vì sao thống kê t và F lại có dạng "tín hiệu chia cho nhiễu", vì sao ANOVA không chỉ là "nhiều t-test gộp lại", và điều gì thực sự xảy ra khi người ta p-hacking. Khung trả lời đã có sẵn từ Phần 3: mọi suy luận đều là câu hỏi về **phân phối mẫu của một thống kê khi giả thuyết không đúng**.

## Phần A — Kiểm định giả thuyết từ gốc

### Mô hình: H₀ đặt một khuôn phân phối lên dữ liệu

Một kiểm định giả thuyết bắt đầu bằng một khẳng định về tham số — ví dụ $H_0: \mu = 7{,}00$ (máy đo pH không lệch khỏi dung dịch chuẩn). Nếu H₀ đúng, dữ liệu là thực hoá của một biến ngẫu nhiên có phân phối *gần như biết trước*, và mọi thống kê tính từ dữ liệu — trung bình, phương sai, thống kê t — đều có phân phối mẫu biết trước (Phần 3). Đó là toàn bộ ý tưởng: **ta không bao giờ biết dữ liệu "bình thường" trông thế nào khi chưa đo, nhưng ta biết chính xác phân phối của thống kê khi H₀ đúng** — nên bất kỳ giá trị nào quá xa vùng "hầu như chắc chắn" của phân phối đó đều là bằng chứng chống H₀.

```definition[p-value]
Cho thống kê kiểm định $T$ và giá trị quan sát $t_{\text{obs}}$. **p-value** của kiểm định là xác suất, tính dưới giả thuyết không, rằng $T$ cực đoan hơn $t_{\text{obs}}$:
$$p = P(T \ge t_{\text{obs}} \mid H_0)$$
với kiểm định một phía, và $p = P(|T| \ge |t_{\text{obs}}| \mid H_0)$ với kiểm định hai phía.
```

Ba hệ quả của định nghĩa này đáng khắc sâu. Thứ nhất, p-value **là một xác suất có điều kiện theo H₀** — nó không phải xác suất H₀ đúng, cũng không phải xác suất sai lầm. Thứ hai, nó được tính *trước khi nhìn dữ liệu* bằng một phân phối cố định; nếu phân phối đó thay đổi giữa chừng (dừng sớm, thử nhiều phân tích), p-value mất nghĩa. Thứ ba, nó đo "mức độ cực đoan" của dữ liệu quan sát, không đo "kích thước hiệu ứng" — một p rất nhỏ có thể đi kèm một hiệu ứng rất nhỏ nếu n lớn.

### Bổ đề trung tâm: dưới H₀, p-value phân phối đều

Kết quả sau đây là nền tảng của mọi diễn giải p-value — và của mọi lời cảnh báo p-hacking:

```lemma[p-value là U(0,1) dưới H₀]
Nếu $T$ có phân phối liên tục và H₀ xác định đúng phân phối của $T$, thì p-value là một biến ngẫu nhiên có phân phối đều trên $[0,1]$:
$$p \mid H_0 \sim U(0,1).$$
```

```proof
Xét kiểm định một phía với $p = 1 - F(T)$, trong đó $F$ là hàm phân phối của $T$ dưới H₀. Với $u \in (0,1)$:
$$P(p \le u) = P\bigl(1 - F(T) \le u\bigr) = P\bigl(F(T) \ge 1 - u\bigr) = 1 - (1 - u) = u,$$
vì $F(T) \sim U(0,1)$ — biến đổi tích phân xác suất (probability integral transform): một biến ngẫu nhiên liên tục đưa qua hàm phân phối của chính nó thì thành phân phối đều. Kiểm định hai phía suy ra tương tự. $\qedhere$
```

Hệ quả ngay lập tức: nếu H₀ đúng và quy trình phân tích được quyết định trước, thì $P(p < 0{,}05) = 0{,}05$ **đúng bằng** — "5% thí nghiệm cho kết quả dương tính giả" không phải xấp xỉ mà là đẳng thức. Điều ngược lại cũng đúng và quan trọng hơn: bất kỳ quy trình nào làm p-value *không* còn phân phối đều dưới H₀ (Hình 3) đều vi phạm định nghĩa — và con số 0,05 bấy giờ không còn ý nghĩa gì.

<figure style="margin:1.8em 0;"><img src="/img/stats/uniform-p.svg" alt="p-value phân phối đều dưới H0" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — (a) 10 000 thí nghiệm mô phỏng đúng quy trình (n = 10, H₀: μ = 0, phân tích quyết định trước): histogram của p-value phẳng, mật độ ≈ 1, và đúng 4,96% có p &lt; 0,05. (b) Cùng 10 000 thí nghiệm nhưng dừng thu thập ngay khi p &lt; 0,05 (optional stopping): 36% "dương tính" thay vì 5% — phân phối p sụp đổ, ý nghĩa của p-value biến mất.</figcaption></figure>

### Vì sao thống kê kiểm định có dạng tỉ số: bổ đề Neyman–Pearson

Câu hỏi thiết kế tự nhiên: giữa muôn vàn cách dùng dữ liệu, đâu là thống kê kiểm định *tốt nhất*? Câu trả lời có từ năm 1933 [^1]:

```theorem[Bổ đề Neyman–Pearson]
Với hai giả thuyết đơn $H_0: \theta = \theta_0$ và $H_1: \theta = \theta_1$, kiểm định có công suất lớn nhất trong số mọi kiểm định mức $\alpha$ là kiểm định bác bỏ H₀ khi **tỉ số khả dĩ** vượt ngưỡng:
$$\Lambda = \frac{L(\theta_1 \mid \text{dữ liệu})}{L(\theta_0 \mid \text{dữ liệu})} \ge c,$$
với $c$ chọn sao cho $P(\Lambda \ge c \mid H_0) = \alpha$.
```

```proof
(Phác thảo.) Gọi $\phi$ là hàm quyết định của một kiểm định bất kỳ mức $\alpha$ và $\phi^*$ là kiểm định tỉ số khả dĩ. Trên miền $\phi^*$ bác bỏ ($\Lambda \ge c$), ta có $(\phi - \phi^*)(\Lambda - c) \ge 0$ vì hai thừa số cùng dấu; trên miền còn lại tích cũng $\ge 0$. Lấy kỳ vọng dưới H₀ và H₁, khai triển, dùng điều kiện mức $\alpha$ của cả hai kiểm định, thu được $\text{power}(\phi) \le \text{power}(\phi^*)$. $\qedhere$
```

Ý nghĩa thực hành: với mô hình chuẩn, tỉ số khả dĩ cho H₁ "μ khác μ₀" hoá ra là một hàm đơn điệu của $|t|$, và cho "mọi trung bình nhóm bằng nhau" là một hàm đơn điệu của $F$. Nói cách khác, **t và F không phải lựa chọn tuỳ tiện — chúng là kiểm định mạnh nhất theo nghĩa Neyman–Pearson cho những mô hình chuẩn mà ta dùng**, và dạng "tín hiệu chia nhiễu" ($t = $ hiệu chia sai số chuẩn, $F = $ phương sai giữa nhóm chia phương sai trong nhóm) phản ánh trực tiếp cấu trúc của tỉ số khả dĩ.

### Công suất: sai lầm loại II và đường cong công suất

```definition[Công suất và sai lầm]
Với ngưỡng bác bỏ cố định, hai sai lầm có thể xảy ra: **sai lầm loại I** (bác bỏ H₀ khi H₀ đúng) với xác suất $\alpha$, và **sai lầm loại II** (không bác bỏ khi H₁ đúng) với xác suất $\beta$. **Công suất (power)** của kiểm định là xác suất bác bỏ H₀ khi H₁ đúng:
$$\text{power} = 1 - \beta = P(\text{bác bỏ} \mid H_1).$$
```

Công suất phụ thuộc ba thứ: cỡ hiệu ứng (tính theo đơn vị $\sigma$), cỡ mẫu, và mức $\alpha$. Ví dụ điển hình — t hai mẫu, hiệu $\delta = 1\sigma$, hai phía, $\alpha = 0{,}05$, dùng xấp xỉ chuẩn cho thống kê t (sai khác so với phân phối t không trung tâm không đáng kể với n này):

```example[Công suất theo cỡ mẫu]
Với n mỗi nhóm, tham số không trung tâm $\lambda = \delta\sqrt{n/2}$. Công suất xấp xỉ $1 - \Phi(z_{0{,}975} - \lambda)$:
$$\begin{array}{c|c|c|c} n & \lambda & \text{công suất} \\ \hline 8 & 2{,}00 & 0{,}52 \\ 16 & 2{,}83 & 0{,}81 \\ 32 & 4{,}00 & 0{,}98 \end{array}$$
Đọc: với n = 8 mỗi nhóm, một hiệu thật 1σ chỉ được phát hiện trong ~một nửa số lần chạy thí nghiệm — "không có ý nghĩa" lúc đó chưa nói được gì về việc hiệu có tồn tại hay không. Muốn công suất 0{,}8, cần n ≈ 16; muốn 0{,}95, cần n ≈ 26.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/power.svg" alt="Công suất của kiểm định" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Phân phối của thống kê chuẩn hoá dưới H₀ (xám) và dưới H₁ (teal, dịch phải 2,83σ với n = 16, δ = 1σ). Diện tích phải của ngưỡng: α/2 = 0,025 dưới H₀ (sai lầm loại I), 0,81 dưới H₁ (công suất). Diện tích trái ngưỡng dưới H₁: β ≈ 0,19 (sai lầm loại II).</figcaption></figure>

### Đối ngẫu: kiểm định và khoảng tin cậy là hai mặt của một đồng xu

```theorem[Đối ngẫu p-value và khoảng tin cậy]
Với kiểm định hai phía $H_0: \mu = \mu_0$ dựa trên trục xoay $T = (\bar{x} - \mu_0)/(s/\sqrt{n})$, bác bỏ H₀ ở mức $\alpha$ khi và chỉ khi $\mu_0$ **nằm ngoài** khoảng tin cậy $(1-\alpha)$ của $\mu$.
```

```proof
Miền bác bỏ là $|T| > t_{\alpha/2}$, tức $|\bar{x} - \mu_0| > t_{\alpha/2}\, s/\sqrt{n}$, tức $\mu_0$ nằm ngoài khoảng $\bar{x} \pm t_{\alpha/2}\,s/\sqrt{n}$ — đúng là khoảng tin cậy (Phần 1, 3). $\qedhere$
```
Hệ quả thực hành: báo cáo khoảng tin cậy là đủ — nó chứa đựng kết quả của *mọi* kiểm định hai phía có thể. Và "khoảng chứa 0" đồng nghĩa "p ≥ 0,05", không cần tính thêm gì.

## Phần B — t-test dưới kính hiển vi

### Vì sao t lại có đuôi dày hơn chuẩn

Thống kê t một mẫu là trục xoay (Phần 3): $T = (\bar{x}-\mu)/(s/\sqrt{n})$. Phân phối t mang tên Student — bút danh của William Gosset, nhà thống kê của nhà máy bia Guinness [^5]. Viết lại:

$$T = \frac{\bar{x}-\mu}{\sigma/\sqrt{n}} \bigg/ \sqrt{\frac{(n-1)s^2}{\sigma^2}\cdot\frac{1}{n-1}} = \frac{Z}{\sqrt{V/(n-1)}},$$

với $Z \sim \mathcal{N}(0,1)$ và $V = (n-1)s^2/\sigma^2 \sim \chi^2(n-1)$. Đây chính là *định nghĩa* của phân phối t:

```theorem[Phân phối t như tỉ số chuẩn tắc trên căn chi bình phương]
Nếu $Z \sim \mathcal{N}(0,1)$ và $V \sim \chi^2(\nu)$ độc lập, thì $T = Z/\sqrt{V/\nu}$ có phân phối t với $\nu$ bậc tự do, mật độ
$$f_T(t) = \frac{\Gamma\bigl((\nu+1)/2\bigr)}{\sqrt{\nu\pi}\,\Gamma(\nu/2)}\left(1 + \frac{t^2}{\nu}\right)^{-(\nu+1)/2}.$$
```
Mật độ này suy ra bằng cách viết mật độ chung của $(Z, V)$, đổi biến sang $(T, V)$ và lấy tích phân theo $V$. Đuôi của t dày hơn chuẩn vì mẫu số $\sqrt{V/\nu}$ *ngẫu nhiên*: những lần $s$ tình cờ nhỏ làm $T$ bùng lên, tạo thêm khối xác suất ở đuôi. Khi $\nu \to \infty$, $V/\nu \to 1$ hầu chắc chắn (định lý số lớn) và $T$ hội tụ về chuẩn tắc — đó là lý do bảng t và bảng chuẩn trùng nhau ở bậc tự do lớn.

Để khép kín, cần một kết quả sâu về tính độc lập của trung bình và phương sai mẫu:

Để khép kín, cần một kết quả sâu về tính độc lập của trung bình và phương sai mẫu — định lý Cochran [^2]:

```theorem[Định lý Cochran, ứng dụng cho t một mẫu]
Cho $X_1, \dots, X_n$ độc lập, cùng phân phối $\mathcal{N}(\mu, \sigma^2)$. Phân tích tổng bình phương:
$$\sum_i \frac{(X_i - \mu)^2}{\sigma^2} = \underbrace{\frac{n(\bar{X}-\mu)^2}{\sigma^2}}_{\text{hạng } 1} + \underbrace{\frac{(n-1)s^2}{\sigma^2}}_{\text{hạng } n-1}.$$
Vì tổng các hạng bằng bậc tự do $n$, Cochran cho $n(\bar{X}-\mu)^2/\sigma^2$ và $(n-1)s^2/\sigma^2$ **độc lập** với nhau, và $(n-1)s^2/\sigma^2 \sim \chi^2(n-1)$. Hệ quả: $\bar{X}$ và $s^2$ độc lập, và $T = (\bar{X}-\mu)/(s/\sqrt{n}) \sim t(n-1)$ — trục xoay của Phần 3 giờ đã có chứng minh.
```

```example[p-value cho máy đo pH — tính đủ các bước]
Hiệu chuẩn máy đo pH bằng dung dịch chuẩn 7,00. Sáu lần đo độc lập: 7,02; 7,04; 6,99; 7,03; 7,01; 7,05. Kiểm định $H_0: \mu = 7{,}00$ hai phía.
$$\bar{x} = 7{,}0233, \quad s = 0{,}0216, \quad SE = \frac{s}{\sqrt{6}} = 0{,}0088, \quad t = \frac{7{,}0233 - 7{,}00}{0{,}0088} = 2{,}65.$$
Với $\nu = 5$: $t_{0{,}975}(5) = 2{,}571$ và p-value hai phía $p = 2 \times P(T_5 \ge 2{,}65) = 0{,}046$. Vì $|t| = 2{,}65 > 2{,}571$ (tương đương $p < 0{,}05$), bác bỏ H₀ — nhưng p nằm sát 0,05, nên bằng chứng là yếu: khoảng tin cậy 95% của μ là $7{,}02 \pm 2{,}571 \times 0{,}0088 = 7{,}02 \pm 0{,}023$, tức $[7{,}00;\ 7{,}04]$ — mép dưới gần chạm đúng 7,00.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/pvalue.svg" alt="p-value là diện tích đuôi" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Phân phối t(5) dưới H₀. p-value hai phía là tổng hai diện tích đuôi ngoài t_obs = 2,65 (teal đậm): p = 0,046. Ngưỡng t_crit = 2,571 (vàng) chia miền bác bỏ mức 0,05; t_obs vừa vượt ngưỡng — kết luận "có ý nghĩa" nhưng sát rìa.</figcaption></figure>

### t hai mẫu: pooled, Welch và công thức bậc tự do

Phần 1 đã dùng Welch. Giờ có thể hiểu vì sao nó tồn tại: thống kê

$$t = \frac{\bar{x}_1 - \bar{x}_2 - (\mu_1 - \mu_2)}{\sqrt{s_1^2/n_1 + s_2^2/n_2}}$$

không có phân phối t chính xác khi phương sai hai nhóm khác nhau — mẫu số là tổ hợp phi tuyến của hai $\chi^2$. Welch và Satterthwaite [^3] đề xuất xấp xỉ mẫu số bằng $c\chi^2(\nu)$ với $\nu$ chọn sao cho khớp kỳ vọng và phương sai:

```definition[Bậc tự do Welch–Satterthwaite]
$$\nu = \frac{\left(s_1^2/n_1 + s_2^2/n_2\right)^2}{\dfrac{(s_1^2/n_1)^2}{n_1 - 1} + \dfrac{(s_2^2/n_2)^2}{n_2 - 1}}.$$
Với $s_1 = 3{,}5$, $n_1 = 8$, $s_2 = 4{,}2$, $n_2 = 8$: $\nu = (1{,}53+2{,}21)^2 / (1{,}53^2/7 + 2{,}21^2/7) = 13{,}6$ — thấp hơn hẳn $n_1+n_2-2 = 14$... vừa đủ thấp hơn, và sẽ thấp hơn nhiều khi hai phương sai lệch mạnh.
```
Thực hành hiện đại: dùng Welch mặc định — nó bảo toàn mức α khi phương sai khác nhau và gần như không mất công suất khi phương sai bằng nhau, nên không có lý do chọn pooled.

### t ghép cặp: chỉ là t một mẫu trên hiệu số

```theorem[t ghép cặp]
Với dữ liệu ghép cặp $(x_i, y_i)$ (cùng cá thể trước/sau), đặt $d_i = x_i - y_i$. Kiểm định hiệu trung bình $\mu_d = 0$ là kiểm định một mẫu trên $d$:
$$t = \frac{\bar{d}}{s_d/\sqrt{n}} \sim t(n-1).$$
```

```example[Ghép cặp loại bỏ biến thiên giữa cá thể]
Mười con chuột, đo glucose trước và sau điều trị: hiệu $d_i$ có $\bar{d} = 2{,}4$ mg/dL, $s_d = 1{,}5$ mg/dL.
$$t = \frac{2{,}4}{1{,}5/\sqrt{10}} = 5{,}06, \qquad p = 0{,}0007.$$
Nếu thí nghiệm (sai) được thiết kế như hai nhóm độc lập, mỗi nhóm 10 con, với độ lệch chuẩn giữa cá thể điển hình 5 mg/dL:
$$t = \frac{2{,}4}{5\sqrt{2/10}} = 1{,}07, \qquad p = 0{,}30.$$
Cùng một hiệu 2,4 mg/dL — nhưng ghép cặp loại biến thiên giữa cá thể (5 mg/dL) ra khỏi sai số, để lại chỉ biến thiên trong cá thể (1,5 mg/dL). Kết quả: từ "không có ý nghĩa" thành "p = 0,0007". Đây là lý do thiết kế ghép cặp (cùng mẫu, cùng giếng, cùng lô) mạnh hơn hẳn khi biến thiên giữa đơn vị lớn.
```

## Phần C — ANOVA: so sánh nhiều trung bình một cách có nguyên tắc

### Mô hình và phân rã tổng bình phương

Phần 1 đã chỉ ra vì sao không làm k t-test riêng lẻ. Giờ xây ANOVA từ mô hình:

```definition[Mô hình ANOVA một yếu tố]
Quan sát $Y_{ij}$ ở nhóm $j$ ($j = 1, \dots, k$), lặp $i = 1, \dots, n$:
$$Y_{ij} = \mu + \alpha_j + \varepsilon_{ij}, \qquad \varepsilon_{ij} \sim \mathcal{N}(0, \sigma^2), \quad \sum_j \alpha_j = 0.$$
Giả thuyết không $H_0: \alpha_1 = \cdots = \alpha_k = 0$ — mọi nhóm có cùng trung bình.
```

Phân rã tổng bình phương là một đẳng thức đại số thuần tuý (không cần giả định chuẩn):

$$\underbrace{\sum_{ij}(Y_{ij} - \bar{Y})^2}_{SS_T} = \underbrace{n\sum_j(\bar{Y}_j - \bar{Y})^2}_{SS_B} + \underbrace{\sum_{ij}(Y_{ij} - \bar{Y}_j)^2}_{SS_W}.$$

Số hạng chéo triệt tiêu vì $\sum_i (Y_{ij} - \bar{Y}_j) = 0$. Với k nhóm, n quan sát mỗi nhóm: bậc tự do $kn-1 = (k-1) + k(n-1)$. Từ Phần 3, dưới H₀ mỗi bình phương chuẩn hoá là $\chi^2$; Cochran cho chúng độc lập — đó là định lý nền của bảng ANOVA:

```theorem[Phân phối của tỉ số F]
Dưới $H_0$: $SS_B/\sigma^2 \sim \chi^2(k-1)$, $SS_W/\sigma^2 \sim \chi^2(kn-k)$, và chúng độc lập (Cochran). Do đó
$$F = \frac{SS_B/(k-1)}{SS_W/(kn-k)} = \frac{MS_B}{MS_W} \sim F(k-1,\, kn-k).$$
Phân phối F chỉ có đuôi phải: F lớn nghĩa là trung bình nhóm tách biệt hơn mức nhiễu nội nhóm, và p-value là $P(F_{k-1,\,kn-k} \ge F_{\text{obs}})$.
```

```example[Ba môi trường nuôi cấy — bảng ANOVA đầy đủ]
Ba môi trường (k = 3), bốn lần lặp (n = 4), đo sinh khối (đơn vị tuỳ ý): nhóm 1: 21, 24, 26, 29; nhóm 2: 25, 28, 30, 33; nhóm 3: 39, 40, 42, 43. Trung bình nhóm 25, 29, 41; trung bình chung 31,7.
$$SS_B = 4\bigl[(25-31{,}7)^2 + (29-31{,}7)^2 + (41-31{,}7)^2\bigr] = 554{,}7,$$
$$SS_W = 34 + 34 + 10 = 78{,}0, \qquad SS_T = 632{,}7.$$
$$\begin{array}{l|c|c|c|c} \text{Nguồn} & SS & df & MS & F \\ \hline \text{Giữa nhóm} & 554{,}7 & 2 & 277{,}3 & 32{,}0 \\ \text{Trong nhóm} & 78{,}0 & 9 & 8{,}67 & \\ \text{Tổng} & 632{,}7 & 11 & & \end{array}$$
So với $F_{0{,}95}(2,9) = 4{,}26$: F = 32,0 vượt xa ngưỡng, p ≈ 8×10⁻⁵. Tỉ số $R^2 = SS_B/SS_T = 0{,}88$: 88% biến thiên của dữ liệu được giải thích bởi yếu tố môi trường — đây là hiệu ứng lớn, không chỉ "có ý nghĩa".
```

<figure style="margin:1.8em 0;"><img src="/img/stats/fdist.svg" alt="Phân phối F và miền bác bỏ" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Phân phối F(2, 9) dưới H₀. Miền bác bỏ mức 0,05 (teal) nằm phải F_crit = 4,26. F_obs = 32,0 nằm rất xa ngoài khung: p ≈ 8×10⁻⁵. F đo "trung bình nhóm tách biệt hơn nhiễu nội nhóm bao nhiêu lần" — ở đây 32 lần.</figcaption></figure>

### Sau khi F có ý nghĩa: so sánh từng cặp đúng cách

F đáng tin cậy chỉ trả lời "có khác biệt giữa các nhóm hay không", không chỉ ra *cặp nào* khác. So sánh từng cặp bằng t-test riêng lẻ lại rơi vào vấn đề so sánh bội (Phần 1). Hai chiến lược chuẩn:

```definition[Tukey HSD và hiệu số tối thiểu]
**Tukey HSD** (honestly significant difference) bác bỏ "nhóm j và l bằng nhau" khi
$$|\bar{Y}_j - \bar{Y}_l| > q_{\alpha;\,k,\,\nu}\,\sqrt{\frac{MS_W}{n}},$$
trong đó $q$ là phân phối **range student hoá** — phân phối của phạm vi (max − min) của k trung bình mẫu chuẩn độc lập. Với ví dụ trên: $q_{0{,}05;3,9} = 3{,}95$, nên HSD = $3{,}95\sqrt{8{,}67/4} = 5{,}81$.
$$\begin{array}{c|c|c|c} \text{Cặp} & \text{Hiệu} & \text{HSD} & \text{Kết luận} \\ \hline 3 - 1 & 16 & 5{,}81 & \text{khác} \\ 3 - 2 & 12 & 5{,}81 & \text{khác} \\ 2 - 1 & 4 & 5{,}81 & \text{không khác} \end{array}$$
```

Kết quả minh hoạ một tình huống thực tế điển hình: F toàn cục có ý nghĩa mạnh, nhưng hai nhóm gần nhau nhất (25 vs 29) không phân biệt được với n = 4 — cần thêm lặp hoặc chấp nhận độ phân giải hạn chế. Tukey kiểm soát xác suất sai lầm loại I của *toàn bộ gia đình so sánh* (family-wise error rate) ở mức α, không phải từng cặp riêng lẻ; công trình gốc [^4] đưa ra cả bảng $q$ cần thiết. Khi có nhiều nhóm hơn và muốn ít bảo thủ hơn, phương pháp Benjamini–Hochberg kiểm soát tỉ lệ phát hiện sai (FDR) [^6] là lựa chọn phổ biến trong các bài báo sinh học hiện đại.

### ANOVA là hồi quy với biến chỉ báo

Mối liên hệ với Phần 4 đáng nắm: mô hình ANOVA $Y = \mu + \alpha_1 D_1 + \alpha_2 D_2 + \varepsilon$ (với $D_1, D_2$ là biến chỉ báo nhóm) là một hồi quy tuyến tính bội; $SS_W$ chính là $SS_{res}$, $R^2 = SS_B/SS_T$ là hệ số xác định của hồi quy, và kiểm định F của ANOVA là kiểm định "mọi hệ số nhóm bằng 0". Nhìn theo cách này, t-test hai mẫu, ANOVA một yếu tố và hồi quy đều là những trường hợp riêng của cùng một máy tuyến tính — lý do vì sao một bài báo dùng "regression output" cho thiết kế nhóm.

## Phần D — Cạm bẫy và thực hành

1. **Optional stopping phá vỡ định nghĩa p-value.** Bổ đề "p ~ U(0,1)" chỉ đúng khi quy trình phân tích cố định. Nhìn dữ liệu từng đợt và dừng khi p < 0,05 (Hình 3b) biến tỉ lệ dương tính giả từ 5% thành 36% — một con số có thể lặp lại bằng mô phỏng 5 dòng code. Nếu phải theo dõi liên tục, quyết định cỡ mẫu và phân tích *trước* khi bắt đầu; dùng thiết kế tuần tự nếu thật sự cần dừng sớm.
2. **Power analysis trước khi chạy, không phải sau.** Một kết quả "không có ý nghĩa" với công suất 0,5 không chứng minh "không có hiệu" — nó chỉ nói thí nghiệm không đủ nhạy. Báo cáo công suất và hiệu ứng tối thiểu muốn phát hiện (Ví dụ công suất ở Phần A); với δ = 1σ muốn power 0,8 cần n ≈ 16 mỗi nhóm.
3. **p nhỏ không phải hiệu lớn.** p đo bằng chứng chống H₀, không đo độ lớn hiệu ứng; báo cáo luôn $\bar{x}_1 - \bar{x}_2$, khoảng tin cậy, và effect size ($d$ của Cohen, $\eta^2 = SS_B/SS_T$). Trong ví dụ ANOVA, p ≈ 10⁻⁴ và η² = 0,88 — cả hai đều cần.
4. **Giả định của t và F.** t một mẫu cần dữ liệu gần chuẩn (hoặc n lớn); ANOVA cần phương sai các nhóm bằng nhau và phần dư chuẩn. Kiểm tra bằng biểu đồ phần dư và các kiểm định chẩn đoán (Shapiro–Wilk cho chuẩn, Levene cho phương sai bằng nhau); khi nghi ngờ, dùng Welch cho hai nhóm, Kruskal–Wallis [^7] cho nhiều nhóm, hoặc bootstrap.
5. **Báo cáo đúng số.** Ghi rõ: thống kê và bậc tự do ($t_5 = 2{,}65$, $F_{2,9} = 32{,}0$), p-value hai phía (không phải "p < 0,05" trần trụi — con số chính xác cho phép người đọc tái đánh giá), khoảng tin cậy, cỡ mẫu, và thiết kế (ghép cặp hay độc lập).

## Lộ trình tiếp theo

Phần này đã cho kiểm định giả thuyết một nền tảng toán học: p-value là U(0,1) dưới H₀ (và vì sao nó sụp đổ khi quy trình thay đổi), thống kê t và F là kiểm định tỉ số khả dĩ mạnh nhất cho mô hình chuẩn, và toàn bộ máy móc t–χ²–F đứng trên định lý Cochran. Để đi tiếp: (1) đọc bổ đề Neyman–Pearson gốc [^1] và Cochran [^2] — cả hai đều ngắn và đọc được; (2) sách của Bickel & Doksum cho lý thuyết kiểm định tổng quát; (3) Tukey [^4] cho so sánh bội, Benjamini–Hochberg [^6] cho FDR; (4) bước tiếp theo tự nhiên của loạt bài: **ANOVA hai yếu tố và tương tác** — phân rã tổng bình phương thêm một tầng, hoặc hồi quy tuyến tính bội với kiểm định từng hệ số dưới ánh sáng chính khung này.

[^1]: J. Neyman and E. S. Pearson, "On the problem of the most efficient tests of statistical hypotheses," *Philosophical Transactions of the Royal Society A* 231: 289–337, 1933.
[^2]: W. G. Cochran, "The distribution of quadratic forms in a normal system, with applications to the analysis of covariance," *Mathematical Proceedings of the Cambridge Philosophical Society* 30(2): 178–191, 1934.
[^3]: F. E. Satterthwaite, "An approximate distribution of estimates of variance components," *Biometrics Bulletin* 2(6): 110–114, 1946; B. L. Welch, "The generalization of Student's problem when several different population variances are involved," *Biometrika* 34(1–2): 28–35, 1947.
[^4]: J. W. Tukey, "Comparing individual means in the analysis of variance," *Biometrics* 5(2): 99–114, 1949.
[^5]: Student, "The probable error of a mean," *Biometrika* 6(1): 1–25, 1908.
[^6]: Y. Benjamini and Y. Hochberg, "Controlling the false discovery rate: a practical and powerful approach to multiple testing," *Journal of the Royal Statistical Society B* 57(1): 289–300, 1995.
[^7]: W. H. Kruskal and W. A. Wallis, "Use of ranks in one-criterion variance analysis," *Journal of the American Statistical Association* 47(260): 583–621, 1952.
