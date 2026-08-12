---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 8: Mô hình hỗn hợp — hiệu ứng ngẫu nhiên cho dữ liệu phân cấp và đo lặp"
date: 2026-08-10T22:00:00
description: "Bảy phần trước luôn giả định các quan sát độc lập — nhưng thực nghiệm hoá-sinh hiếm khi như vậy: các giếng nằm chung một đĩa, các lần đo trên cùng một con chuột, các mẻ thuốc thử khác nhau. Bài viết xây dựng mô hình hỗn hợp tuyến tính (LMM): hiệu ứng cố định và ngẫu nhiên, hệ số tương quan nội lớp (ICC), ước lượng REML so với ML, BLUP và hiện tượng shrinkage, kiểm định thành phần phương sai với bài toán biên, và GLMM mở rộng sang dữ liệu nhị phân và số đếm. Ví dụ đầy đủ: hoạt độ enzyme đo trên 4 đĩa × 3 giếng (pseudo-replication, cỡ mẫu hiệu dụng, sai lầm loại I 33,8% so với 5%) và 5 mẫu đo lặp trên máy đọc nhiễu (BLUP kéo về trung bình chung)."
topic: mathematics
tags: [statistics, mixed-models, random-effects, lmm, icc, blup, pseudoreplication, tutorial]
featured: false
draft: false
---

Bảy phần trước xây dựng toàn bộ máy móc suy luận trên một giả định thầm lặng: các quan sát **độc lập**. Nhưng dữ liệu thực nghiệm hoá-sinh hầu như luôn **phân cấp (nested)**: ba giếng nằm chung một đĩa, năm lần đo trên cùng một con chuột, các mẻ thuốc thử trộn chung một lần. Những quan sát cùng một đơn vị thì **tương quan** với nhau — chúng chia sẻ cùng một "cá tính" của đơn vị đó (cùng đĩa, cùng con chuột, cùng mẻ). Xử lý chúng như độc lập là **pseudo-replication**, một trong những sai lầm phổ biến nhất trong sinh học thực nghiệm [^1]. Phần này xây mô hình đúng cho cấu trúc đó — **mô hình hỗn hợp (mixed model)**, mảnh ghép cuối nối GLM (Phần 7) với thực tế đa cấp của phòng thí nghiệm.

## Phần A — Dữ liệu phân cấp và vì sao "độc lập" sụp đổ

Hãy xét một thí nghiệm quen thuộc: đo hoạt độ enzyme (U/mg) trên **4 đĩa** (mẻ), mỗi đĩa **3 giếng**:

```example[Hoạt độ enzyme trên 4 đĩa × 3 giếng]
Đĩa 1: 9,8 · 10,5 · 10,3 — trung bình 10,20
Đĩa 2: 11,9 · 12,4 · 11,8 — trung bình 12,03
Đĩa 3: 13,9 · 14,3 · 13,7 — trung bình 13,97
Đĩa 4: 16,1 · 15,7 · 16,4 — trung bình 16,07
Trung bình chung: 13,07 U/mg.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/nested.svg" alt="Cấu trúc phân cấp 4 đĩa × 3 giếng" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Dữ liệu enzyme: trong mỗi đĩa, ba giếng bám sát trung bình đĩa (σ_w = 0,34); nhưng các trung bình đĩa cách xa nhau (σ_b = 2,52). Tổng biến thiên của 12 con số đến từ hai nguồn khác bản chất — và chúng không cộng vào "12 quan sát độc lập".</figcaption></figure>

Nhìn Hình 1: trong mỗi đĩa, ba giếng lệch quanh trung bình đĩa rất ít (σ_w = 0,34), nhưng bản thân các trung bình đĩa trải rộng từ 10,2 đến 16,1 (σ_b = 2,52). Nếu coi 12 giếng như 12 quan sát độc lập, ta đã gộp hai nguồn biến thiên khác bản chất thành một — và **đếm quá nhiều thông tin**: ba giếng trong một đĩa gần như lặp lại cùng một thông tin ("đĩa 1 hơi thấp").

```definition[Hiệu ứng cố định và hiệu ứng ngẫu nhiên]
Trong mô hình $Y_{ij} = \mu + \alpha_i + \varepsilon_{ij}$, yếu tố $i$ được gọi là **cố định (fixed)** nếu các mức của nó là toàn bộ mức ta quan tâm — so sánh *chúng với nhau* (liều, nhiệt độ, pH, hai quy trình tổng hợp). Yếu tố là **ngẫu nhiên (random)** nếu các mức quan sát được chỉ là **một mẫu ngẫu nhiên từ một quần thể mức lớn hơn** — và ta quan tâm đến *phương sai của quần thể đó*, không phải từng mức cụ thể (đĩa, lô thuốc, con chuột, ngày thí nghiệm). Ký hiệu: $b_i \sim \mathcal{N}(0,\sigma_b^2)$ — mỗi đĩa $i$ có "độ lệch riêng" $b_i$ rút từ phân phối chuẩn với phương sai $\sigma_b^2$.
```

Cùng một yếu tố có thể là cố định ở thí nghiệm này, ngẫu nhiên ở thí nghiệm khác: bốn đĩa của *thí nghiệm này* thì ngẫu nhiên (ta muốn suy luận về quần thể đĩa nói chung); nhưng nếu ta cố tình chọn đĩa A, B, C, D để so sánh thì chúng thành cố định. Ba tiêu chí thực hành: (1) các mức có **thay đổi được** không (liều thì có, đĩa thì không); (2) có **trao đổi được (exchangeable)** không — đổi tên đĩa 1 và đĩa 2 có đổi ý nghĩa không; (3) mục tiêu là **so sánh mức** hay **ước lượng phương sai**.

## Phần B — Mô hình hỗn hợp tuyến tính (LMM)

Với dữ liệu phân cấp hai tầng (quan sát $j$ trong đơn vị $i$), mô hình hỗn hợp đơn giản nhất — **random intercept**:

$$Y_{ij} = \mu + b_i + \varepsilon_{ij}, \qquad b_i \sim \mathcal{N}(0,\sigma_b^2), \quad \varepsilon_{ij} \sim \mathcal{N}(0,\sigma^2),$$

trong đó $b_i$ độc lập với $\varepsilon_{ij}$. Khác hẳn mô hình tuyến tính thường: giờ có **hai** tham số phương sai, $\sigma_b^2$ (giữa các đơn vị) và $\sigma^2$ (trong đơn vị), ngoài trung bình $\mu$. Viết dạng ma trận chung: $Y = X\beta + Zb + \varepsilon$, với $X\beta$ là phần cố định, $Zb$ là phần ngẫu nhiên — $Z$ là ma trận "chỉ đơn vị", mỗi cột một đĩa.

```lemma[Cấu trúc phương sai]
Với mô hình random intercept, $E[Y_{ij}] = \mu$ và
$$\operatorname{Cov}(Y_{ij}, Y_{i'j'}) = \begin{cases} \sigma_b^2 + \sigma^2 & i = i',\ j = j' \text{ (cùng quan sát)}, \\ \sigma_b^2 & i = i' \text{ (cùng đĩa, khác giếng)}, \\ 0 & i \neq i' \text{ (khác đĩa)}. \end{cases}$$
```

*Chứng minh.* $Y_{ij} = \mu + b_i + \varepsilon_{ij}$ với $b_i$, $\varepsilon_{ij}$ độc lập, trung bình 0. Phương sai: $\operatorname{Var}(b_i + \varepsilon_{ij}) = \sigma_b^2 + \sigma^2$. Hai quan sát cùng đĩa $i$ chia sẻ cùng $b_i$ nên hiệp phương sai $\operatorname{Cov}(b_i + \varepsilon_{ij},\, b_i + \varepsilon_{ij'}) = \operatorname{Var}(b_i) = \sigma_b^2$ (các $\varepsilon$ độc lập, triệt tiêu). Khác đĩa: không có thành phần chung, hiệp phương sai 0. $\blacksquare$

Hệ quả trực tiếp: **tương quan giữa hai giếng cùng đĩa** là $\rho = \sigma_b^2/(\sigma_b^2 + \sigma^2)$ — hệ số tương quan nội lớp (ICC). Nó trả lời câu hỏi: *bao nhiêu phần trăm phương sai tổng đến từ khác biệt giữa các đơn vị?*

```definition[Hệ số tương quan nội lớp ICC]
$$\operatorname{ICC} = \frac{\sigma_b^2}{\sigma_b^2 + \sigma^2}.$$
ICC = 0: các đơn vị hoàn toàn giống nhau, mọi biến thiên là nhiễu đo — dữ liệu gần như độc lập. ICC = 1: mọi quan sát trong một đơn vị là bản sao hoàn hảo của nhau — ba giếng chỉ là một quan sát. ICC càng cao, **thông tin thực sự càng ít**.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/icc.svg" alt="So sánh ICC thấp và ICC cao" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Cùng ba nhóm, cùng số điểm: (a) ICC = 0,28 — nhiễu trong nhóm lớn, các nhóm chồng lấn, ranh giới mờ; (b) ICC = 0,95 — các nhóm tách hẳn, một điểm "thuộc nhóm nào" gần như chắc chắn. ICC quyết định mức độ lặp lại của thông tin trong mỗi nhóm.</figcaption></figure>

### Ước lượng: REML hay ML?

Ước lượng hợp lý tối đa (ML) cho $\mu$, $\sigma_b^2$, $\sigma^2$ có một thiên lệch có hệ thống: nó **không trừ bậc tự do đã dùng cho các hiệu ứng cố định**. Với mô hình chỉ có intercept, ML co $\sigma^2$ đi hệ số $(N-1)/N$: với $N = 12$, thiên lệch 8,3%. **REML (restricted maximum likelihood)** ước lượng các thành phần phương sai trên phần dư đã loại phần cố định, nên không thiên lệch.

```example[REML so với ML trên dữ liệu enzyme]
Phân tích một chiều cho $SS_W = 0{,}90$, $MS_W = 0{,}1125$; $SS_B = 57{,}29$, $MS_B = 19{,}10$. Công thức kín cho thiết kế cân bằng:
$$\hat\sigma^2 = MS_W = 0{,}113, \qquad \hat\sigma_b^2 = \frac{MS_B - MS_W}{3} = \frac{19{,}10 - 0{,}1125}{3} = 6{,}33.$$
REML cho $\hat\sigma_b = \sqrt{6{,}33} = 2{,}52$ và $\hat\sigma = \sqrt{0{,}113} = 0{,}34$ — khớp chú thích Hình 1. ML cho cùng dữ liệu: $\hat\sigma^2_{ML} = 0{,}103$ (co đi 8,3%) và $\hat\sigma_b^2{}_{ML} = 4{,}74$ (co đi 25%!). Với cỡ mẫu lớn, hai ước lượng hội tụ về nhau; với $N$ nhỏ như thí nghiệm này, **dùng REML**.
```

### Hệ quả định lượng: cỡ mẫu hiệu dụng và khoảng tin cậy

Phương sai của trung bình chung $\bar X$: với $k$ đơn vị, $n$ quan sát mỗi đơn vị,

$$\operatorname{Var}(\bar X) = \frac{\sigma_b^2}{k} + \frac{\sigma^2}{kn}.$$

So với công thức "độc lập" $\sigma^2_{\text{tổng}}/N$: thành phần $\sigma_b^2/k$ **không giảm khi thêm giếng** — chỉ giảm khi thêm đĩa. Đây là nguồn gốc của **cỡ mẫu hiệu dụng** $n_{\text{eff}} = N / [1 + (n-1)\operatorname{ICC}]$: số quan sát độc lập "tương đương" mà dữ liệu thực sự chứa.

```example[Khoảng tin cậy của hoạt độ enzyme trung bình]
Với $k = 4$ đĩa, $n = 3$ giếng, ICC = 0,98:
$$\operatorname{Var}(\bar X) = \frac{6{,}33}{4} + \frac{0{,}113}{12} = 1{,}59, \qquad SE = 1{,}26.$$
So sánh hai cách tính:
- **Naive** (coi 12 giếng độc lập): $s = 2{,}30$, $SE = 2{,}30/\sqrt{12} = 0{,}66$, CI 95% $= 13{,}07 \pm 2{,}201 \times 0{,}66 = [11{,}6;\ 14{,}5]$.
- **Đúng** (mô hình hỗn hợp, df = $k-1 = 3$): $SE = 1{,}26$, CI 95% $= 13{,}07 \pm 3{,}182 \times 1{,}26 = [9{,}1;\ 17{,}1]$.

SE đúng gấp **1,9 lần** SE naive, khoảng tin cậy rộng gấp gần 3 lần — và cỡ mẫu hiệu dụng chỉ là $n_{\text{eff}} = 12/[1+2\times0{,}98] = 3{,}3 \approx 4$: **bằng số đĩa**, không phải số giếng. Đó không phải điều đáng buồn: đó là sự thật về thông tin trong thiết kế này.
```

## Phần C — BLUP và hiện tượng shrinkage

Mô hình hỗn hợp không chỉ sửa khoảng tin cậy — nó còn cho ta **ước lượng tốt hơn cho từng đơn vị**. Ước lượng trung bình đĩa 4 theo cách thường: $\bar Y_{4} = 16{,}07$. Nhưng đĩa 4 chỉ có 3 giếng; trung bình chung 13,07 là một "thông tin trước" mạnh. Ước lượng tối ưu phải **cân bằng** hai nguồn:

```theorem[BLUP — best linear unbiased predictor]
Với mô hình random intercept, ước lượng tuyến tính không chệch tốt nhất (theo nghĩa cực tiểu sai số bình phương trung bình) cho độ lệch $b_i$ của đơn vị $i$ là
$$\hat b_i = \gamma\,(\bar Y_{i\cdot} - \hat\mu), \qquad \gamma = \frac{n_i\,\sigma_b^2}{n_i\,\sigma_b^2 + \sigma^2},$$
tức ước lượng cho trung bình đơn vị: $\hat\mu + \hat b_i = \gamma\,\bar Y_{i\cdot} + (1-\gamma)\,\hat\mu$ — trung bình thô của đơn vị **kéo về trung bình chung**.
```

*Chứng minh (một dòng).* Ta tìm $\gamma$ cực tiểu $E[(\mu + \gamma(\bar Y_{i\cdot} - \mu) - (\mu + b_i))^2] = E[(\gamma(\varepsilon_{\text{trung bình}}) + (\gamma-1)b_i)^2] = \gamma^2\sigma^2/n_i + (\gamma-1)^2\sigma_b^2$. Đạo hàm triệt tiêu: $2\gamma\sigma^2/n_i + 2(\gamma-1)\sigma_b^2 = 0$, suy ra $\gamma = n_i\sigma_b^2/(n_i\sigma_b^2 + \sigma^2)$. $\blacksquare$

Hệ số $\gamma$ đọc như **độ tin cậy**: nếu đơn vị có nhiều quan sát ($n_i$ lớn) hoặc khác biệt giữa đơn vị rõ ($\sigma_b^2$ lớn so với nhiễu), $\gamma \to 1$ — tin trung bình đơn vị. Nếu dữ liệu ít và nhiễu lớn, $\gamma$ nhỏ — kéo mạnh về trung bình chung. Chú ý: $\gamma = \operatorname{ICC}$ khi $n_i = 1$, và $\gamma \to 1$ khi $n_i \to \infty$. Đây chính là tư tưởng James–Stein: ước lượng riêng lẻ bị "co" về trung bình chung sẽ **giảm tổng sai số bình phương** — hiện tượng được Robinson gọi là "điều tốt lành nhất của BLUP" [^2][^6].

```example[Năm mẫu protein đo hai lần trên máy đọc nhiễu]
Một máy đọc plate có nhiễu kỹ thuật lớn: 5 mẫu, mỗi mẫu đo 2 lần. Phân tích phương sai: $\hat\sigma^2 = 0{,}68$, $\hat\sigma_b^2 = 0{,}53$, nên
$$\gamma = \frac{2 \times 0{,}53}{2 \times 0{,}53 + 0{,}68} = 0{,}61.$$
Trung bình thô của mẫu 4 là 5,70; BLUP kéo nó về trung bình chung 6,80:
$$6{,}80 + 0{,}61 \times (5{,}70 - 6{,}80) = 6{,}13.$$
Mẫu có ước lượng nhiễu nhất bị kéo mạnh nhất — không phải "làm sai lệch" mà là **thu hồi thông tin**: trung bình chung của 5 mẫu dựa trên 10 phép đo đáng tin hơn trung bình của 1 mẫu dựa trên 2 phép đo.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/shrinkage.svg" alt="BLUP kéo trung bình mẫu về trung bình chung" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Trung bình thô của từng mẫu (○) bị kéo về trung bình chung 6,80 (●) với γ = 0,61: mẫu 4 (5,70 → 6,13) kéo mạnh nhất vì nó cách xa trung bình chung nhất trên nền nhiễu lớn. BLUP là lý do các phân tích "empirical Bayes" cho kết quả ổn định hơn từng ước lượng đơn lẻ.</figcaption></figure>

## Phần D — Kiểm định thành phần phương sai

Có cần hiệu ứng ngẫu nhiên không? Kiểm định $H_0: \sigma_b^2 = 0$ bằng tỉ số khả dĩ (LRT): $D = 2(\ell_{\text{đầy đủ}} - \ell_{\text{rút gọn}})$, với lý thuyết tiệm cận do Self và Liang phát triển [^3]. Nhưng có một cạm bẫy tinh tế:

```remark[Kiểm định tại biên]
$H_0: \sigma_b^2 = 0$ nằm **trên biên** của không gian tham số ($\sigma_b^2 \ge 0$), không phải trong lòng. Dưới $H_0$, $D$ không theo $\chi^2_1$ thuần tuý mà theo hỗn hợp $0{,}5\,\chi^2_0 + 0{,}5\,\chi^2_1$ (nửa khối lượng tại 0). Hệ quả thực hành: **chia đôi p-value naive** — nếu phần mềm báo $p = 0{,}08$ cho kiểm định $\sigma_b^2 = 0$, p đúng là $0{,}04$. Với dữ liệu enzyme, $D = 675{,}8$ — kết luận rõ ràng có ý nghĩa dù tính theo cách nào; nhưng với các hiệu ứng ngẫu nhiên yếu, chia đôi là bắt buộc.
```

Quy tắc vàng: LRT cho thành phần phương sai phải so sánh hai mô hình **cùng phần cố định**, ước lượng bằng ML (REML làm LRT giữa các mô hình khác phần cố định là không hợp lệ).

## Phần E — Mở rộng: random slope và GLMM

Random intercept chỉ cho phép mỗi đơn vị có "mức nền" riêng. Nếu mỗi con chuột không chỉ khác mức glucose nền mà còn khác **tốc độ thay đổi theo thời gian**, cần random slope:

$$Y_{ij} = \mu + \alpha X_{ij} + b_{0i} + b_{1i} X_{ij} + \varepsilon_{ij}, \qquad \begin{pmatrix} b_{0i} \\ b_{1i} \end{pmatrix} \sim \mathcal{N}\!\left(0, \begin{pmatrix} \sigma_0^2 & \sigma_{01} \\ \sigma_{01} & \sigma_1^2 \end{pmatrix}\right).$$

Hai hiệu ứng ngẫu nhiên có thể tương quan ($\sigma_{01}$) — thường một con chuột khởi đầu cao thì tăng chậm. Cấu trúc phương sai giờ là ma trận 2×2, không còn là một con số.

Khi phản hồi không chuẩn — nhị phân (sống/chết) hay số đếm (khuẩn lạc) — nối GLM của Phần 7 với hiệu ứng ngẫu nhiên thành **GLMM**: giữ nguyên link và phân phối (logit, log), thêm $Zb$ vào thành phần tuyến tính $\eta = X\beta + Zb$. Ví dụ: đo tỉ lệ sống trên nhiều đĩa — mỗi đĩa có $b_i$ riêng, làm tương quan các con chuột trong cùng đĩa. Ước lượng GLMM khó hơn hẳn (tích phân không kín lên $b$), phần mềm dùng xấp xỉ Laplace hoặc tích phân số [^4].

## Cạm bẫy thực hành

1. **Pseudo-replication.** Coi các quan sát cùng đơn vị là độc lập làm sai lầm loại I phình to. Mô phỏng 5000 thí nghiệm enzyme với $H_0$ đúng ($\mu = 13$, $\sigma_b^2 = 6{,}33$, $\sigma^2 = 0{,}113$): phân tích naive bác bỏ $H_0$ ở **33,8%** thay vì 5%; phân tích theo 4 trung bình đĩa (tương đương mô hình hỗn hợp) cho đúng **5,0%** — Hình 4.
2. **Quá ít đơn vị.** $\sigma_b^2$ ước lượng từ 3–4 đĩa rất không ổn định (khoảng tin cậy cực rộng). Khi số đơn vị < 5–6, cân nhắc xử lý như hiệu ứng cố định, hoặc báo cáo kèm cảnh báo. Ngược lại, đừng đòi "đủ 30 đơn vị" cho hiệu ứng ngẫu nhiên như quy tắc n ≥ 30 của CLT — quy tắc đó không áp dụng ở đây.
3. **Quên chia đôi p ở biên.** Kiểm định $\sigma_b^2 = 0$ cần p = 0,5·P(χ²₁ > D) (Phần D). Phần mềm thường báo p naive.
4. **Singular fit.** Ước lượng $\hat\sigma_b^2 = 0$ hoặc tương quan ±1: mô hình quá tham số so với dữ liệu — thường vì quá ít đơn vị hoặc cấu trúc ngẫu nhiên quá phức tạp. Rút gọn (bỏ random slope) trước khi kết luận.
5. **Trộn hai ngôn ngữ.** "Đĩa khác nhau có trung bình khác nhau" (p < 0,001) của kiểm định F cố định nói về **4 đĩa này**; mô hình hỗn hợp nói về **quần thể đĩa**. Nếu mục tiêu là quần thể, đừng dùng kiểm định fixed với 4 mức rồi nói về quần thể.
6. **Báo cáo đủ.** ICC, $\hat\sigma_b^2$ và $\hat\sigma^2$, phương pháp (REML/ML), cách tính bậc tự do (Satterthwaite hoặc Kenward–Roger cho mẫu nhỏ), và luôn nêu rõ đơn vị phân tích là gì.

<figure style="margin:1.8em 0;"><img src="/img/stats/pseudorep.svg" alt="Sai lầm loại I của pseudo-replication" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Mô phỏng 5000 thí nghiệm enzyme với H₀ đúng: xử lý 12 giếng như độc lập cho sai lầm loại I 33,8% (gần 7 lần mức danh nghĩa); phân tích đúng theo 4 đĩa cho 5,0%. Đây là chi phí định lượng của pseudo-replication — và lý do các tạp chí sinh học từ chối phân tích như vậy [^1].</figcaption></figure>

## Lộ trình tiếp theo

Loạt tám phần đã đi từ mô tả dữ liệu đến mô hình hỗn hợp — một giáo trình thống kê hoàn chỉnh cho nghiên cứu sinh hoá-sinh. Để đi sâu: (1) sách chuẩn của Pinheiro và Bates [^5] và bài báo lme4 của Bates et al. [^4]; (2) bài tổng quan BLUP của Robinson [^2] và nguồn gốc Henderson [^6]; (3) Hurlbert [^1] cho toàn bộ hệ hình thái của pseudo-replication trong sinh học; (4) bước tiếp theo tự nhiên: **dữ liệu dọc và phân tích sống sót** (repeated measures qua thời gian, censoring) — mảnh ghép cuối cho dữ liệu lâm sàng và sinh học phát triển.

[^1]: S. H. Hurlbert, "Pseudoreplication and the design of ecological field experiments," *Ecological Monographs* 54(2): 187–211, 1984.
[^2]: G. K. Robinson, "That BLUP is a good thing: The estimation of random effects," *Statistical Science* 6(1): 15–32, 1991.
[^3]: S. G. Self and K.-Y. Liang, "Asymptotic properties of maximum likelihood estimators and likelihood ratio tests under nonstandard conditions," *Journal of the American Statistical Association* 82(398): 605–610, 1987.
[^4]: D. Bates, M. Mächler, B. Bolker, and S. Walker, "Fitting linear mixed-effects models using lme4," *Journal of Statistical Software* 67(1): 1–48, 2015.
[^5]: J. C. Pinheiro and D. M. Bates, *Mixed-Effects Models in S and S-PLUS*, Springer, 2000.
[^6]: C. R. Henderson, "Best linear unbiased estimation and prediction under a selection model," *Biometrics* 31(2): 423–447, 1975.
