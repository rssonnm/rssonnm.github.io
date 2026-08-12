---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 7: Mô hình tuyến tính tổng quát — hồi quy logistic và Poisson"
date: 2026-08-10T20:00:00
description: "Sáu phần trước xử lý phản hồi liên tục, phân phối chuẩn. Nhưng thực nghiệm hoá-sinh thường cho dữ liệu nhị phân (sống/chết, mọc/không mọc) và số đếm (khuẩn lạc, tế bào, xung) — những phản hồi mà hồi quy tuyến tính không thể mô hình hoá đúng. Bài viết xây dựng mô hình tuyến tính tổng quát (GLM): cấu trúc ba thành phần (phân phối, thành phần tuyến tính, link function), ước lượng hợp lý tối đa, kiểm định Wald và tỉ số khả dĩ. Hai ví dụ hoàn chỉnh: phân tích LD50 bằng hồi quy logistic (5 liều × 20 chuột, tỉ số odds, độc tính) và đếm khuẩn lạc theo nồng độ chất khử trùng bằng hồi quy Poisson (rate ratio, overdispersion, quasi-Poisson)."
topic: mathematics
tags: [statistics, glm, logistic-regression, poisson-regression, ld50, overdispersion, tutorial]
featured: false
draft: false
---

Sáu phần trước xây dựng toàn bộ máy móc cho phản hồi liên tục, phân phối chuẩn: hồi quy tuyến tính, ANOVA, kiểm định t và F. Nhưng phần lớn dữ liệu thực nghiệm hoá-sinh không phải vậy. Một con chuột **chết hay sống**; một giếng **mọc hay không mọc**; một đĩa cho **bao nhiêu khuẩn lạc**; một mẫu phóng xạ phát **bao nhiêu xung**. Ba đặc điểm của những phản hồi này làm hồi quy tuyến tính sụp đổ: giá trị bị chặn (0/1, hoặc ≥ 0), phương sai **phụ thuộc trung bình** (Phần 2: Bernoulli có Var = p(1−p), Poisson có Var = λ), và phần dư không thể chuẩn. Phần này xây mô hình đúng cho chúng — **mô hình tuyến tính tổng quát (GLM)**, khung thống nhất do Nelder và Wedderburn đề xuất năm 1972 [^1].

## Phần A — Vì sao hồi quy tuyến tính không dùng được

Hãy thử mô hình hoá xác suất chết $p$ như một hàm tuyến tính của liều: $p = a + bx$ (mô hình xác suất tuyến tính, LPM). Với dữ liệu LD50 của Phần C, bình phương tối thiểu cho $\hat{p} = -0{,}125 + 0{,}714\,x$ — và hai giá trị dự đoán vô nghĩa:

```remark[Ba lỗi của mô hình tuyến tính cho xác suất]
(1) **Dự đoán lọt ra ngoài [0,1]**: $\hat{p} = -0{,}13$ khi $x = 0$ (xác suất âm), $\hat{p} = 1{,}16$ khi $x = 1{,}8$ (xác suất > 1). (2) **Phương sai phụ thuộc trung bình**: với phản hồi nhị phân, $\operatorname{Var}(Y) = p(1-p)$ — nhỏ ở hai đầu, lớn nhất ở $p = 0{,}5$ — nên giả định phương sai không đổi của hồi quy (Phần 6) sai ngay từ gốc. (3) **Phần dư không chuẩn**: $Y$ chỉ nhận 0 hoặc 1, phần dư $Y - \hat{p}$ không bao giờ chuẩn. Cả ba lỗi cùng đến từ một chỗ: mô hình tuyến tính không tôn trọng bản chất của phản hồi.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/lpm-vs-logit.svg" alt="Mô hình tuyến tính cho xác suất" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Cùng dữ liệu LD50: đường logistic (teal) nằm gọn trong (0,1); đường hồi quy tuyến tính (xám đứt) cho p̂ = −0,13 ở liều thấp và p̂ = 1,16 ở liều cao — xác suất âm và xác suất vượt 1. Đó là lý do phải biến đổi thang đo trước khi mô hình hoá.</figcaption></figure>

## Phần B — Cấu trúc của GLM

Thay vì ép $p$ hay $\lambda$ vào một đường thẳng, GLM mô hình hoá một **hàm trơn của trung bình**:

```definition[Mô hình tuyến tính tổng quát]
Một GLM gồm ba thành phần:
1. **Phân phối của phản hồi** $Y$ thuộc họ mũ — chuẩn, Bernoulli, Poisson;
2. **Thành phần tuyến tính** $\eta = \beta_0 + \beta_1 X_1 + \cdots + \beta_p X_p$ — giống hệt hồi quy bội;
3. **Link function** $g$, hàm đơn điệu khả nghịch nối trung bình với thành phần tuyến tính: $g(\mu) = \eta$.

$$\begin{array}{l|c|c|c} \text{Phản hồi} & \text{Phân phối} & \text{Link } g(\mu) & \text{Mô hình} \\ \hline \text{liên tục} & \mathcal{N}(\mu, \sigma^2) & \mu \text{ (identity)} & \text{hồi quy tuyến tính} \\ \text{nhị phân } 0/1 & \text{Bernoulli}(p) & \ln\frac{p}{1-p} \text{ (logit)} & \text{hồi quy logistic} \\ \text{số đếm} & \text{Poisson}(\lambda) & \ln\lambda \text{ (log)} & \text{hồi quy Poisson} \end{array}$$
```

Hồi quy tuyến tính của Phần 6 chỉ là trường hợp riêng đầu tiên. Hai link còn lại đưa tham số vào miền tự nhiên của nó: logit biến xác suất $p \in (0,1)$ thành số thực bất kỳ, log biến tốc độ $\lambda > 0$ thành số thực bất kỳ — vậy thành phần tuyến tính không bao giờ tạo ra dự đoán vô lý. Đây chính là "biến đổi trước khi mô hình hoá" mà Hình 2 gợi ý.

```definition[Tỉ số odds]
**Odds** của một biến cố xác suất $p$ là $p/(1-p)$ — tỉ số "khả năng xảy ra : khả năng không xảy ra". **Tỉ số odds (odds ratio, OR)** giữa hai nhóm là tỉ số của hai odds. Trong hồi quy logistic, $e^{\beta_j}$ là OR của $Y$ khi $X_j$ tăng 1 đơn vị (các biến khác cố định).
```

## Phần C — Hồi quy logistic

### Mô hình và ước lượng hợp lý tối đa

Hồi quy logistic cho dữ liệu nhị phân được Cox đưa vào khung hồi quy năm 1958 [^2]; cho phân tích bioassay nó có gốc từ Berkson [^3] và Finney [^4].

```definition[Mô hình hồi quy logistic]
$$\ln\frac{p}{1-p} = \beta_0 + \beta_1 X, \qquad p = \frac{1}{1 + e^{-(\beta_0 + \beta_1 X)}}.$$
Đường cong $p(X)$ là **sigmoid**: tiến 0 khi $X \to -\infty$, tiến 1 khi $X \to +\infty$, dốc nhất tại điểm uốn.
```

Khác với hồi quy tuyến tính, **không có công thức đóng** cho $\hat{\beta}$ — phương trình chuẩn tắc phi tuyến, giải bằng lặp. Log-likelihood của n quan sát Bernoulli:

$$\ell(\beta) = \sum_{i=1}^{n} \bigl[y_i \ln p_i + (1 - y_i)\ln(1 - p_i)\bigr], \qquad p_i = \frac{1}{1+e^{-\eta_i}},$$

và điều kiện cực đại cho một hệ phương trình đẹp:

```theorem[Phương trình score của logistic]
Ước lượng hợp lý tối đa $\hat{\beta}$ là nghiệm của
$$\sum_i \bigl(y_i - p_i(\beta)\bigr) x_{ij} = 0 \quad \text{với mọi } j,$$
tức **tổng phần dư $y_i - \hat{p}_i$ nhân với mỗi biến phải bằng 0** — cùng dạng trực giao $X^\top e = 0$ của hồi quy bội (Phần 6), nhưng với $p$ phi tuyến. Giải bằng Newton–Raphson: mỗi bước là một bình phương tối thiểu có trọng số lặp lại (IRLS).
```
Phương trình này giải thích vì sao máy tính cần lặp: $p_i$ phụ thuộc $\beta$ qua sigmoid, nên không tách được $\beta$ như hồi quy tuyến tính. Khi hội tụ, ma trận hiệp phương sai của $\hat{\beta}$ ước lượng từ đạo hàm bậc hai của $\ell$, và kiểm định dùng máy quen thuộc của Phần 5: **kiểm định Wald** $z = \hat{\beta}_j/SE_j \sim \mathcal{N}(0,1)$ (asymptotic), hoặc **kiểm định tỉ số khả dĩ** qua deviance.

```definition[Deviance]
**Deviance** của một mô hình là $D = -2\bigl[\ell(\text{mô hình}) - \ell(\text{mô hình bão hoà})\bigr]$ — đo khoảng cách khả dĩ giữa mô hình và mô hình khớp hoàn hảo từng điểm. Hiệu deviance giữa hai mô hình lồng nhau có phân phối $\chi^2$ với hiệu số tham số: so sánh mô hình "có biến" với mô hình "chỉ hệ số chặn" (null) là kiểm định ý nghĩa của biến, và deviance của mô hình khớp tốt phải cỡ bậc tự do của nó.
```

### Ví dụ: LD50 — liều gây chết 50%

Phân tích độc tính (bioassay) là ứng dụng kinh điển của logistic, từ Berkson [^3] và Finney [^4]:

```example[LD50 bằng hồi quy logistic]
Năm liều chất độc, mỗi liều 20 chuột, đếm số chết: $x = \log_{10}(\text{liều})$ = 0,30; 0,60; 0,90; 1,20; 1,50 → chết 2, 6, 10, 15, 19. Hợp lý tối đa cho
$$\ln\frac{\hat{p}}{1-\hat{p}} = -3{,}32 + 3{,}82\,x,$$
với $SE = (0{,}69;\, 0{,}73)$, Wald $z = (-4{,}8;\, 5{,}2)$, cả hai $p < 0{,}0001$. Tỉ số odds của mỗi bậc log₁₀ liều: $OR = e^{3{,}82} = 45{,}5$ (95% CI $10{,}8$–$192$) — khoảng rộng vì chỉ 100 chuột, nhưng hiệu ứng liều rõ ràng. Độ khớp: deviance = 0,62 với 3 bậc tự do ($p = 0{,}89$ — mô hình khớp rất tốt); deviance null = 42,9, hiệu 42,2 với 1 bậc tự do ($p < 0{,}0001$).

**LD50** là liều mà $\hat{p} = 0{,}5$, tức $\eta = 0$: $x_{50} = -\hat{\beta}_0/\hat{\beta}_1 = 0{,}869$, tức **7,4 mg/kg**. Sai số chuẩn bằng phương pháp delta: $SE(x_{50}) = 0{,}066$, nên khoảng 95% của $\log_{10}(\text{LD50})$ là $[0{,}74;\ 1{,}00]$, tức **LD50 = 7,4 mg/kg (95% CI 5,5–10,0)**. Giá trị dự đoán: 0,10; 0,27; 0,53; 0,78; 0,92 so với quan sát 0,10; 0,30; 0,50; 0,75; 0,95.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/logistic-fit.svg" alt="Đường cong liều đáp ứng LD50" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Đường cong liều–đáp ứng logit qua 5 điểm quan sát (vàng). LD50 là liều cắt đường p = 0,5: log₁₀(LD50) = 0,869 → 7,4 mg/kg, khoảng 95% [5,5; 10,0] (nét đứt xám). Độ dốc β₁ = 3,82 quyết định "dải liều chuyển tiếp" hẹp hay rộng.</figcaption></figure>

```remark[Diễn giải OR đúng]
$OR = 45{,}5$ nghĩa là *odds* chết tăng 45 lần khi liều tăng gấp 10 — không phải xác suất tăng 45 lần (xác suất bị chặn trên bởi 1). Khi biến cố không hiếm, OR khác xa RR (risk ratio) và không nên đọc như nhau. Với biến liên tục, OR là tỉ số odds cho **mỗi đơn vị tăng** của biến — phải nói rõ đơn vị.
```

## Phần D — Hồi quy Poisson

### Mô hình và rate ratio

Số đếm $Y \sim \text{Poisson}(\lambda)$ (Phần 2) có $E[Y] = \operatorname{Var}(Y) = \lambda$ — phương sai tăng theo trung bình, nên mô hình hoá $\lambda$ trực tiếp cũng sai như mô hình hoá $p$. Link log biến $\lambda > 0$ thành số thực:

$$\ln\lambda = \beta_0 + \beta_1 X, \qquad \lambda = e^{\beta_0 + \beta_1 X}.$$

Log-likelihood Poisson: $\ell(\beta) = \sum_i \bigl[y_i \ln\lambda_i - \lambda_i\bigr]$ (bỏ hằng số $\ln y_i!$), và phương trình score tương tự: $\sum_i (y_i - \lambda_i) x_{ij} = 0$. Hệ số $\beta_1$ đọc qua **rate ratio**: $e^{\beta_1}$ là hệ số nhân của tốc độ đếm khi $X$ tăng 1 đơn vị.

```example[Số khuẩn lạc theo nồng độ chất khử trùng]
Đếm khuẩn lạc trên 5 nồng độ chất khử trùng (liều 0–4 mg/L, mỗi điểm tổng của 3 đĩa): 128, 47, 26, 15, 8. Hợp lý tối đa cho
$$\ln\hat{\lambda} = 4{,}79 - 0{,}74\,x,$$
với $SE(\hat{\beta}_1) = 0{,}064$, Wald $z = -11{,}7$ ($p < 0{,}0001$). Rate ratio: $e^{-0{,}74} = 0{,}477$ (95% CI 0,42–0,54) — **mỗi mg/L chất khử trùng làm số khuẩn lạc giảm khoảng 52%**. Deviance = 3,3 với 3 bậc tự do: dev/df = 1,1 ≈ 1 — đúng mức của dữ liệu Poisson. Deviance null = 184,6; hiệu 181,3 với 1 bậc tự do ($p < 0{,}0001$).
```

<figure style="margin:1.8em 0;"><img src="/img/stats/poisson-fit.svg" alt="Hồi quy Poisson và overdispersion" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — (a) Dữ liệu Poisson khớp tốt: đường λ̂ = e^{4,79−0,74x}, thanh dọc ±√λ là độ lệch chuẩn dự đoán của Poisson (tăng theo λ), dev/df = 1,1. (b) Cùng cấu trúc nhưng số đếm phân tán hơn (130, 45, 35, 8, 7): dev/df = 2,5 — phương sai vượt trung bình, Poisson không còn đúng.</figcaption></figure>

### Overdispersion: khi phương sai vượt trung bình

```definition[Overdispersion và quasi-Poisson]
Nếu deviance lớn hơn hẳn bậc tự do ($\text{dev}/df \gg 1$), dữ liệu **phân tán quá mức (overdispersed)**: phương sai thực vượt trung bình — đúng cảnh báo từ Phần 2 về overdispersion của đếm khuẩn lạc (cụm, biến thiên sinh học giữa đĩa). Cách sửa nhẹ nhất: **quasi-Poisson** — giữ ước lượng hệ số, nhân mọi sai số chuẩn với $\sqrt{\text{dev}/df}$. Với ví dụ trên: $\sqrt{2{,}53} = 1{,}59$, khoảng tin cậy của rate ratio rộng gấp 1,6 lần. Cách triệt để hơn: phân phối negative binomial (thêm tham số phân tán $\theta$ vào $\operatorname{Var}(Y) = \lambda + \lambda^2/\theta$).
```

```remark[Offset: khi đếm trên "nền" khác nhau]
Nếu các đĩa không cùng diện tích, các mẫu không cùng thể tích, hay thời gian đếm khác nhau, tốc độ đếm phải chuẩn hoá: $\ln\lambda_i = \ln(\text{nền}_i) + \beta_0 + \beta_1 X_i$, trong đó $\ln(\text{nền}_i)$ là **offset** — hệ số cố định bằng 1, không ước lượng. Ví dụ đếm khuẩn lạc trên đĩa diện tích khác nhau: đưa $\ln(\text{diện tích})$ vào mô hình với hệ số 1, thay vì chia tỉ lệ trước khi phân tích (phép chia làm sai phương sai Poisson).
```

## Phần E — Chọn mô hình và chẩn đoán

Cùng một quy trình với hồi quy bội (Phần 6): so sánh mô hình lồng nhau bằng **drop-in-deviance** (hiệu deviance ~ χ², hiệu số tham số); so sánh mô hình không lồng nhau bằng AIC $= -2\ell + 2k$; kiểm tra phần dư (deviance residuals) theo giá trị dự đoán. Điểm khác biệt lớn nhất so với hồi quy tuyến tính: không có "R²" chuẩn — một số phần mềm báo pseudo-R² (như McFadden $1 - \ell(\text{mô hình})/\ell(\text{null})$), đọc như thước đo tương đối, không như tỉ lệ phương sai giải thích.

## Cạm bẫy thực hành

1. **Separation — dữ liệu tách hoàn toàn.** Nếu một ngưỡng X tách sạch 0 và 1 (mọi mẫu dưới ngưỡng sống, trên ngưỡng chết), hợp lý tối đa cho $\hat{\beta}_1 \to \infty$: thuật toán không hội tụ, sai số chuẩn phình to. Dấu hiệu: deviance nhỏ bất thường, SE khổng lồ. Không có dữ liệu mới thì không cứu được — có thể dùng Firth penalty hoặc báo cáo trung thực giới hạn.
2. **Cỡ mẫu.** Logistic cần đủ số biến cố: quy tắc ngón tay cái "10 biến cố cho mỗi tham số" (events per variable) — với 20 biến cố chết và 2 tham số như ví dụ LD50, khoảng tin cậy của OR rộng (10,8–192) đã phản ánh điều đó.
3. **Đọc OR sai.** OR không phải RR, nhất là khi biến cố phổ biến; với biến liên tục phải gắn đơn vị. Nói "xác suất tăng 45 lần" là sai khi OR = 45,5.
4. **Bỏ qua overdispersion.** Đếm sinh học hầu như luôn hơi overdispersed; bỏ qua làm p-value quá lạc quan. Luôn kiểm tra dev/df và nhân SE khi cần.
5. **Thiếu offset.** Đếm trên nền khác nhau mà không đưa offset vào là so sánh tốc độ sai.
6. **GLM không phải phép màu.** Link và phân phối giúp đúng phạm vi và phương sai, nhưng vẫn cần mô hình đúng dạng (tuyến tính trong η), quan sát độc lập, và không ngoại suy.

## Lộ trình tiếp theo

Loạt bảy phần đã phủ trọn một giáo trình thống kê ứng dụng: mô tả dữ liệu, xác suất, suy luận, lan truyền sai số, kiểm định, mô hình tuyến tính, và giờ là GLM. Để đi sâu: (1) bài gốc Nelder–Wedderburn [^1] và sách chuẩn McCullagh–Nelder [^5]; (2) Collett [^6] cho hồi quy nhị phân chi tiết; (3) Finney [^4] cho phân tích bioassay cổ điển; (4) bước tiếp theo tự nhiên: **mô hình hỗn hợp (mixed models)** — thêm hiệu ứng ngẫu nhiên cho thiết kế có khối, cá thể lặp, dữ liệu dọc — là cầu nối giữa GLM và thực tế đa cấp của dữ liệu sinh học.

[^1]: J. A. Nelder and R. W. M. Wedderburn, "Generalized linear models," *Journal of the Royal Statistical Society A* 135(3): 370–384, 1972.
[^2]: D. R. Cox, "The regression analysis of binary sequences," *Journal of the Royal Statistical Society B* 20(2): 215–242, 1958.
[^3]: J. Berkson, "Application of the logistic function to bio-assay," *Journal of the American Statistical Association* 39(227): 357–365, 1944.
[^4]: D. J. Finney, *Probit Analysis*, 3rd ed., Cambridge University Press, 1971.
[^5]: P. McCullagh and J. A. Nelder, *Generalized Linear Models*, 2nd ed., Chapman & Hall, 1989.
[^6]: D. Collett, *Modelling Binary Data*, 2nd ed., Chapman & Hall, 2003.
