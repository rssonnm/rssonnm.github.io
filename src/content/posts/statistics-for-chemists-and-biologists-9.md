---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 9: Dữ liệu dọc và phân tích sống sót"
date: 2026-08-11T00:00:00
description: "Tám phần trước xử lý quan sát độc lập hoặc phân cấp một lần. Nhưng nhiều dữ liệu hoá-sinh theo dõi cùng đơn vị qua thời gian (dọc) hoặc đo thời gian đến biến cố (sống sót, hay survival) — hai loại dữ liệu mà phương pháp thường không áp dụng được. Bài viết này gồm hai phần: dữ liệu dọc (longitudinal data) với mô hình hai giai đoạn và tương quan trong cùng chủ thể; và phân tích sống sót với kiểm duyệt phải, ước lượng Kaplan–Meier, kiểm định log-rank và mô hình nguy cơ tỉ lệ Cox. Ví dụ chi tiết: glucose chuột theo dõi 5 tuần dưới hai chế độ ăn (naive p=0,00007, đúng p=0,061) và thời gian tái phát của thuốc điều trị (KM trung vị 19 so với 9 ngày, log-rank p=0,014, Cox HR=0,27)."
topic: mathematics
tags: [statistics, longitudinal-data, mixed-models, survival-analysis, kaplan-meier, log-rank, cox-regression, tutorial]
featured: false
draft: false
---

Tám phần trước xây dựng toàn bộ máy móc cho dữ liệu cắt ngang — mỗi đơn vị được đo một lần, các quan sát độc lập. Nhưng nhiều câu hỏi khoa học có một chiều thời gian: một con chuột thay đổi thế nào qua 4 tuần ăn kiêng? Một bệnh nhân sống được bao lâu sau điều trị? Phần này xử lý hai dạng dữ liệu động:

- **Dữ liệu dọc (longitudinal):** cùng đơn vị đo nhiều lần qua thời gian — mỗi đơn vị là một "chuỗi nhỏ", các điểm trong chuỗi tương quan.
- **Dữ liệu sống sót (survival):** thời gian đến biến cố — thường bị kiểm duyệt (censored) vì biến cố chưa xảy ra khi kết thúc nghiên cứu.

## Phần A — Dữ liệu dọc: theo dõi theo thời gian

Khác với đo lặp (Phần 8: ba giếng trên một đĩa), dữ liệu dọc có **thứ tự thời gian** — và câu hỏi thường là về **tốc độ thay đổi** (slope), không chỉ trung bình. Năm con chuột được đo glucose mỗi tuần trong 5 tuần dưới một trong hai chế độ ăn:

<figure style="margin:1.8em 0;"><img src="/img/stats/longitudinal.svg" alt="Dữ liệu dọc glucose theo tuần" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Năm con chuột mỗi nhóm, mỗi con đo 5 tuần liên tiếp. Mỗi đường mảnh là một con chuột — 5 điểm không độc lập. Đường đứt là trung bình nhóm: nhóm chế độ ăn X (đỏ) cao hơn đối chứng (vàng) khoảng 0,6 mM.</figcaption></figure>

### Hai cách tiếp cận

**Cách 1 — Gộp tất cả (sai).** Coi $5 \times 5 = 25$ điểm của mỗi nhóm là độc lập, chạy $t$-test:

$$\text{naive: } t = 4{,}36,\ \text{df} = 48,\ p = 0{,}00007.$$

Kết luận: khác biệt rất có ý nghĩa. Nhưng **sai** — 25 điểm không phải 25 quan sát độc lập, chúng đến từ 5 con chuột.

**Cách 2 — Hai giai đoạn (đúng).** Giai đoạn 1: tính trung bình của mỗi con chuột qua 5 tuần (mỗi con cho một giá trị duy nhất). Giai đoạn 2: so sánh $n = 5$ giá trị mỗi nhóm bằng $t$-test thường:

```example[Two-stage so sánh hai chế độ ăn]
Trung bình mỗi chuột:
- Đối chứng: 5,56 · 5,90 · 6,37 · 6,36 · 6,67 → trung bình nhóm 6,17
- Chế độ ăn X: 6,31 · 6,33 · 6,94 · 7,00 · 7,27 → trung bình nhóm 6,77
Hiệu số: 0,60 mM.
$$t = \frac{0{,}60}{0{,}275} = 2{,}18,\ \text{df} = 8,\ p = 0{,}061.$$
```

Khác biệt 0,60 mM không có ý nghĩa thống kê ở mức 5%. Cỡ mẫu thực sự là 5 con chuột mỗi nhóm, không phải 25 điểm — và $SE$ đúng ($0{,}275$) lớn gấp **2 lần** $SE$ sai ($0{,}137$) của phân tích gộp.

```definition[Phân tích hai giai đoạn (two-stage)]
Với thiết kế dọc cân bằng (cùng số lần đo, cùng thời điểm), phương pháp hai giai đoạn cho kết quả đồng nhất với mô hình hỗn hợp có random slope (Phần 8): slope trung bình của $k$ chuột là $\bar\beta = \frac{1}{k}\sum \beta_i$, phương sai $SE(\bar\beta) = s_\beta/\sqrt{k}$, kiểm định với $\text{df} = k-2$ — chính xác như phân tích trên $k$ giá trị tóm tắt.
```

Hai giai đoạn không chỉ đơn giản mà còn minh bạch: nó tách rõ việc ước lượng từng chuỗi con (giai đoạn 1) khỏi so sánh giữa các nhóm (giai đoạn 2). Khi thiết kế không cân bằng (số lần đo khác nhau, thời điểm lệch), cần mô hình hỗn hợp với cấu trúc hiệp phương sai cho thời gian — nhưng tư tưởng thì giống: **đơn vị phân tích là con chuột, không phải từng lần đo**.

## Phần B — Phân tích sống sót

Khi câu hỏi là "bao lâu đến biến cố" — chuột chết, khối u tái phát, máy hỏng — dữ liệu có một đặc điểm độc đáo: **kiểm duyệt (censoring)**. Một con chuột còn sống khi kết thúc thí nghiệm: ta biết nó **sống ít nhất đến ngày đó**, nhưng không biết khi nào nó thực sự chết. Loại bỏ nó là lãng phí thông tin; coi nó như chết là sai lầm nghiêm trọng. Thời gian kiểu này đòi hỏi công cụ riêng.

<figure style="margin:1.8em 0;"><img src="/img/stats/censoring.svg" alt="Minh hoạ kiểm duyệt phải" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Minh hoạ kiểm duyệt phải: bệnh nhân A (tái phát ngày 6) cho thông tin đầy đủ; bệnh nhân D còn sống ở ngày 33 — ta chỉ biết thời gian sống ít nhất 33 ngày, đó là giá trị kiểm duyệt. Bỏ D hay coi D tái phát ngày 33 đều sai.</figcaption></figure>

### Hàm sống sót và ước lượng Kaplan–Meier

Gọi $T$ là thời gian đến biến cố. Hai hàm cơ bản:

$$S(t) = P(T > t),\qquad h(t) = \lim_{\Delta t \to 0} \frac{P(t \le T < t+\Delta t \mid T \ge t)}{\Delta t},$$

với $S(t)$ là **xác suất sống sót qua thời điểm $t$**, và $h(t)$ là **nguy cơ (hazard) tức thời** tại $t$ với điều kiện còn sống đến $t$. Liên hệ: $S(t) = \exp\!\bigl(-\int_0^t h(u)\,du\bigr)$.

Ước lượng $S(t)$ từ dữ liệu kiểm duyệt — **ước lượng Kaplan–Meier** [^2] — là một chuỗi tích bước nhảy: tại mỗi thời điểm có biến cố, $S(t)$ nhân với $(1 - d/n_{\text{nguy cơ}})$, trong đó $d$ là số biến cố và $n_{\text{nguy cơ}}$ là số cá thể chưa có biến cố và chưa bị kiểm duyệt ngay trước thời điểm đó.

```example[Kaplan–Meier trên dữ liệu thời gian tái phát]
Hai nhóm bệnh nhân, mỗi nhóm 10 người, theo dõi 40 ngày (× = kiểm duyệt):
- **Thuốc** (ngày): 6 · 7 · 10 · 15 · 19 · 22 · 25× · 28 · 33× · 40 biến cố
- **Placebo** (ngày): 3 · 4 · 6 · 8 · 9 · 12 · 14 · 16 · 18 · 20 (không kiểm duyệt)

Tại $t=9$ (placebo): còn 6 người nguy cơ, 1 biến cố → $S = 0{,}6 \times (1-1/6) = 0{,}5$. Trung vị: $\hat t_{0,5} = \min\{t: \hat S(t) \le 0{,}5\}$.
Đường cong cho thấy **trung vị** thuốc = 19 ngày, placebo = 9 ngày.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/km.svg" alt="Đường Kaplan-Meier cho hai nhóm" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Đường Kaplan–Meier cho hai nhóm thuốc (teal) và placebo (vàng). Dấu × đánh dấu thời điểm kiểm duyệt. Trung vị khác biệt 10 ngày; log-rank χ² = 6,00, p = 0,014.</figcaption></figure>

### Kiểm định log-rank

So sánh hai đường cong sống sót bằng **kiểm định log-rank** [^3]. Tại mỗi thời điểm biến cố $t$, xây bảng $2\times2$: số biến cố quan sát ($d_1, d_2$) và số kỳ vọng dưới $H_0$ ($E_1 = d\cdot n_1/n$, $E_2 = d\cdot n_2/n$). Thống kê:

$$\chi^2_{\text{LR}} = \frac{(O_1 - E_1)^2}{\operatorname{Var}(O_1 - E_1)} \sim \chi^2_1, \quad \operatorname{Var} = \sum_t \frac{d_t\,(n_t-d_t)\,n_{1t}\,n_{2t}}{n_t^2\,(n_t-1)}.$$

Với dữ liệu trên: $O_1 = 7$ biến cố thuốc, $E_1 = 11{,}4$, $V = 3{,}30$, $\chi^2 = 6{,}00$, $p = 0{,}014$ — thuốc cải thiện thời gian tái phát có ý nghĩa.

### Mô hình nguy cơ tỉ lệ Cox (Cox PH)

Log-rank so sánh hai nhóm; Cox [^4] cho phép nhiều biến và ước lượng **tỉ số nguy cơ (hazard ratio, HR)**:

$$h(t \mid X) = h_0(t)\,\exp(\beta_1 X_1 + \cdots + \beta_p X_p).$$

Mô hình **bán tham số**: $h_0(t)$ là hazard nền không xác định dạng — để tự do — trong khi các hệ số $\beta$ ước lượng qua hợp lý riêng phần (partial likelihood).

```example[Cox cho dữ liệu tái phát]
Biến $X$: 1 = thuốc, 0 = placebo. Hợp lý riêng phần cực đại:
$$\hat\beta = -1{,}30,\quad \text{HR} = e^{\hat\beta} = 0{,}272,\quad 95\%\ \text{CI} = [0{,}089; 0{,}825].$$

Thuốc giảm nguy cơ tái phát khoảng 73% so với placebo ($p = 0{,}022$, Wald). Kết quả đồng nhất với log-rank ($p = 0{,}014$): Cox dùng nhiều thông tin hơn (tỉ lệ, không chỉ so sánh) nên hẹp hơn về ý nghĩa thực tế, không chỉ $p$-value.
```

```remark[Giả định tỉ lệ nguy cơ không đổi (PH)]
Cox giả định $h(t\mid X=1) / h(t\mid X=0) = e^{\beta}$ — tỉ lệ không đổi theo thời gian. Kiểm tra: vẽ $-\ln(-\ln S(t))$ theo $t$: hai đường **song song** nếu PH đúng; **cắt nhau** nếu PH sai. Nếu vi phạm, có thể dùng Cox phân tầng (stratified) hoặc mô hình với biến phụ thuộc thời gian (time-dependent covariate).
```

<figure style="margin:1.8em 0;"><img src="/img/stats/ph.svg" alt="Giả định tỉ lệ nguy cơ" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Giả định tỉ lệ nguy cơ (PH): (a) hai đường không cắt nhau, PH đúng — log(h(t)) giữa hai nhóm song song; (b) hai đường cắt nhau, PH sai — hazard ratio thay đổi theo thời gian, cần mô hình phức tạp hơn.</figcaption></figure>

## Cạm bẫy thực hành

### Dữ liệu dọc
1. **Pseudo-replication qua thời gian.** Phân tích gộp (naive) trên 25 điểm như 25 chuột độc lập cho $p = 0{,}00007$; two-stage trên 5 chuột cho $p = 0{,}061$ — cùng hiệu số 0,6 mM, kết luận trái ngược. Luôn xác định đơn vị phân tích đúng.
2. **Chỉ so sánh từng thời điểm.** Chạy 5 $t$-test riêng cho 5 tuần: sai lầm loại I phình to (Phần 5), bỏ qua thông tin về xu hướng.
3. **Thiếu điểm baseline.** Nếu chỉ đo sau can thiệp, không biết nhóm đã khác nhau từ trước. Thiết kế dọc mạnh nhất khi có đo trước-sau trong cùng chủ thể.

### Phân tích sống sót
1. **Xử lý kiểm duyệt sai.** Hai sai lầm phổ biến: coi censored như dead (thiên lệch âm — đánh giá thấp thời gian sống) hoặc bỏ censored (mất thông tin, thiên lệch dương).
2. **Median survival không tồn tại.** Nếu đường KM không xuống dưới 0,5, không thể tính trung vị — chỉ báo cáo $S(t)$ tại các thời điểm cụ thể hoặc xác suất sống ở một mốc thời gian.
3. **Cỡ mẫu: đếm sự kiện, không đếm cá thể.** Công suất của log-rank và Cox phụ thuộc vào **số biến cố** (events), không phải số bệnh nhân. Một nghiên cứu 100 bệnh nhân nhưng chỉ 10 biến cố có công suất thấp hơn nghiên cứu 40 bệnh nhân với 30 biến cố. Quy tắc ngón tay cái: cần ít nhất 10–20 biến cố cho mỗi biến trong Cox.
4. **Kiểm tra PH.** Giả định PH không tự nhiên đúng — luôn kiểm tra bằng đồ thị $-\ln(-\ln S(t))$ hoặc kiểm định Schoenfeld residuals.

## Lộ trình tiếp theo

Loạt chín phần đã phủ một giáo trình thống kê hoàn chỉnh: mô tả dữ liệu → xác suất → phân phối mẫu → lan truyền sai số → kiểm định → mô hình tuyến tính → GLM → mô hình hỗn hợp → dữ liệu dọc và sống sót. Để đi sâu: (1) Diggle et al. [^1] và Fitzmaurice et al. cho dữ liệu dọc; (2) các hàm sống sót tham số (Weibull, log-normal) cho Cox khi PH không hợp lệ; (3) mô hình frailty (hiệu ứng ngẫu nhiên trong survival — nối Part 8); (4) competing risks khi có nhiều loại biến cố khác loại trừ nhau; (5) sách Collett [^5] và Therneau–Grambsch [^6] cho Cox nâng cao; (6) dữ liệu sóng (time series) và phép biến đổi Fourier cho tín hiệu hoá-sinh — một hướng hoàn toàn mới.

[^1]: P. J. Diggle, P. Heagerty, K.-Y. Liang, and S. L. Zeger, *Analysis of Longitudinal Data*, 2nd ed., Oxford University Press, 2002.
[^2]: E. L. Kaplan and P. Meier, "Nonparametric estimation from incomplete observations," *Journal of the American Statistical Association* 53(282): 457–481, 1958.
[^3]: R. Peto and J. Peto, "Asymptotically efficient rank invariant test procedures," *Journal of the Royal Statistical Society A* 135(2): 185–207, 1972.
[^4]: D. R. Cox, "Regression models and life-tables," *Journal of the Royal Statistical Society B* 34(2): 187–220, 1972.
[^5]: D. Collett, *Modelling Survival Data in Medical Research*, 3rd ed., CRC Press, 2014.
[^6]: T. M. Therneau and P. M. Grambsch, *Modeling Survival Data: Extending the Cox Model*, Springer, 2000.