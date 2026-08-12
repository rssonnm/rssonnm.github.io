---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 6: Hồi quy tuyến tính bội và ANOVA hai yếu tố"
date: 2026-08-10T18:00:00
description: "Hai công cụ phân tích nhiều biến quen thuộc nhất trong phòng thí nghiệm hoá-sinh — hồi quy tuyến tính bội và ANOVA hai yếu tố — thực ra là hai mặt của cùng một mô hình tuyến tính. Bài viết xây hồi quy bội từ hình học bình phương tối thiểu (β̂ = (XᵀX)⁻¹XᵀY, phân phối của hệ số, kiểm định t và F, R² điều chỉnh, VIF) với ví dụ hoạt độ enzyme theo nồng độ cơ chất và chất ức chế; rồi xây ANOVA hai yếu tố với phân rã tổng bình phương bốn thành phần và tương tác (nhiệt độ × pH), minh hoạ vì sao tương tác buộc phải đọc kết quả theo từng mức yếu tố."
topic: mathematics
tags: [statistics, multiple-regression, two-way-anova, interaction, collinearity, tutorial]
featured: false
draft: false
---

Phần 5 đã cho kiểm định giả thuyết một nền tảng: p-value là U(0,1) dưới H₀, thống kê t và F là kiểm định tỉ số khả dĩ, và toàn bộ máy móc t–χ²–F đứng trên định lý Cochran. Phần này mở rộng sang hai công cụ nhiều biến quan trọng nhất của thực hành hoá-sinh: **hồi quy tuyến tính bội** (nhiều biến dự đoán liên tục) và **ANOVA hai yếu tố** (hai yếu tố phân loại, kèm tương tác). Điểm cốt lõi xuyên suốt: hai công cụ này là **cùng một mô hình tuyến tính** — ANOVA là hồi quy với biến chỉ báo, hồi quy là ANOVA với biến liên tục — nên mọi thứ Phần 4, 5 đã xây (lan truyền sai số, phân phối mẫu, kiểm định) dùng chung một bộ máy.

## Phần A — Hồi quy tuyến tính bội

### Mô hình và hình học của bình phương tối thiểu

```definition[Mô hình hồi quy tuyến tính bội]
Với n quan sát và p biến dự đoán, mô hình viết gọn bằng ma trận:
$$Y = X\beta + \varepsilon, \qquad \varepsilon \sim \mathcal{N}(0,\, \sigma^2 I),$$
trong đó $Y$ là vector n chiều của biến phản hồi, $X$ là ma trận thiết kế $n \times (p+1)$ (cột đầu là toàn 1 cho hệ số chặn), $\beta = (\beta_0, \beta_1, \dots, \beta_p)^\top$ là vector hệ số, và $\varepsilon$ là nhiễu độc lập, cùng phân phối chuẩn, phương sai $\sigma^2$.
```

Mỗi hệ số $\beta_j$ có diễn giải riêng — **hiệu ứng riêng phần (partial effect)**: $\beta_j$ là thay đổi trung bình của $Y$ khi $X_j$ tăng 1 đơn vị, *giữ mọi biến khác không đổi*. Đây là khác biệt cốt lõi với tương quan từng cặp (Phần 1): hồi quy bội tách ảnh hưởng của từng biến khỏi sự lẫn nhau của chúng.

Ước lượng $\hat{\beta}$ được chọn để cực tiểu $\|Y - X\beta\|^2$ — tổng bình phương phần dư. Bài toán có một cách nhìn hình học đẹp:

```theorem[Nghiệm bình phương tối thiểu]
Cực tiểu $\|Y - X\beta\|^2$ đạt tại
$$\hat{\beta} = (X^\top X)^{-1} X^\top Y$$
(với $X^\top X$ khả nghịch — tức các cột của $X$ độc lập tuyến tính). Phần dư $e = Y - X\hat{\beta}$ **vuông góc với mọi cột của $X$**: $X^\top e = 0$.
```

```proof
Gọi $C(X)$ là không gian sinh bởi các cột của $X$. Với bất kỳ $\beta$, $X\beta \in C(X)$, và
$$\|Y - X\beta\|^2 = \|Y - X\hat{\beta}\|^2 + \|X\hat{\beta} - X\beta\|^2$$
khi $Y - X\hat{\beta} \perp C(X)$ (định lý Pythagoras trong không gian Euclid). Số hạng thứ hai $\ge 0$ và bằng 0 khi $\beta = \hat{\beta}$ — nên $\hat{\beta}$ là nghiệm duy nhất. Điều kiện trực giao $X^\top(Y - X\hat{\beta}) = 0$ chính là **phương trình chuẩn tắc** $X^\top X\hat{\beta} = X^\top Y$, giải ra công thức trên. $\qedhere$
```

Phương pháp bình phương tối thiểu có từ Legendre (1805) và Gauss (1809) [^1], và định lý Gauss–Markov [^2] đảm bảo $\hat{\beta}$ là ước lượng tuyến tính không chệch có phương sai nhỏ nhất trong lớp mọi ước lượng tuyến tính không chệch — dù không cần giả định chuẩn.

<figure style="margin:1.8em 0;"><img src="/img/stats/betahat.svg" alt="Hình học bình phương tối thiểu" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Bình phương tối thiểu là phép chiếu trực giao: Ŷ = Xβ̂ là hình chiếu của Y lên không gian cột của X, và phần dư e = Y − Ŷ vuông góc với không gian đó. Điều kiện trực giao Xᵀe = 0 cho β̂ = (XᵀX)⁻¹XᵀY.</figcaption></figure>

### Phân phối của hệ số ước lượng: trục xoay cho hồi quy

Mỗi hệ số $\hat{\beta}_j$ là một ước lượng — tức một biến ngẫu nhiên có phân phối mẫu. Tính nó giống hệt khung của Phần 3:

```theorem[Phân phối của hệ số hồi quy]
$$\hat{\beta} \sim \mathcal{N}\bigl(\beta,\, \sigma^2 (X^\top X)^{-1}\bigr).$$
Cụ thể: $E[\hat{\beta}_j] = \beta_j$ (không chệch) và $\operatorname{SD}(\hat{\beta}_j) = \sigma\sqrt{\bigl[(X^\top X)^{-1}\bigr]_{jj}}$. Ước lượng $\sigma^2$ không chệch là
$$s^2 = \frac{\|Y - X\hat{\beta}\|^2}{n - p - 1}, \qquad E[s^2] = \sigma^2,$$
và với $SE_j = s\sqrt{[(X^\top X)^{-1}]_{jj}}$:
$$T_j = \frac{\hat{\beta}_j - \beta_j}{SE_j} \sim t(n-p-1).$$
```

```proof
Thay $Y = X\beta + \varepsilon$ vào $\hat{\beta}$:
$$\hat{\beta} = \beta + (X^\top X)^{-1}X^\top \varepsilon,$$
là một biến đổi tuyến tính của $\varepsilon \sim \mathcal{N}(0, \sigma^2I)$ nên chuẩn, kỳ vọng $\beta$ (vì $E[\varepsilon]=0$), và $\operatorname{Var}(\hat{\beta}) = (X^\top X)^{-1}X^\top \cdot \sigma^2 I \cdot X(X^\top X)^{-1} = \sigma^2(X^\top X)^{-1}$. Phần dư là phép chiếu lên phần bù trực giao của $C(X)$ — dạng toàn phương hạng $n-p-1$, nên theo Cochran (Phần 5): $s^2$ độc lập với $\hat{\beta}$ và $(n-p-1)s^2/\sigma^2 \sim \chi^2(n-p-1)$. Chia chuẩn tắc cho căn $\chi^2/\text{df}$ được $t$. $\qedhere$
```

Hệ quả thực hành: kiểm định $H_0: \beta_j = 0$ (biến $X_j$ không có hiệu ứng riêng phần) dùng $t = \hat{\beta}_j/SE_j$ với $n-p-1$ bậc tự do — đúng máy t-test của Phần 5, chỉ đổi bậc tự do. Kiểm định toàn cục "mọi hệ số dốc bằng 0" dùng F:

$$F = \frac{SS_{reg}/p}{SS_{res}/(n-p-1)} \sim F(p,\, n-p-1), \qquad SS_{reg} = SS_{tot} - SS_{res}.$$

### Ví dụ: hoạt độ enzyme theo cơ chất và chất ức chế

```example[Hồi quy bội với hai biến dự đoán]
Đo hoạt độ enzyme $Y$ (U/mL) ở 10 tổ hợp nồng độ cơ chất $X_1 = [S]$ (mM, 1–10) và chất ức chế $X_2 = [I]$ (µM, 22–34):
$$\begin{array}{c|cccccccccc} [S] & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9 & 10 \\ \hline [I] & 25 & 22 & 28 & 24 & 30 & 26 & 32 & 28 & 34 & 30 \\ Y & 17{,}8 & 20{,}5 & 20{,}1 & 21{,}0 & 20{,}9 & 22{,}4 & 23{,}3 & 25{,}8 & 24{,}9 & 26{,}6 \end{array}$$
Giải $\hat{\beta} = (X^\top X)^{-1}X^\top Y$ cho:
$$\hat{y} = 21{,}98 + 1{,}07\,[S] - 0{,}199\,[I],$$
$$\begin{array}{c|c|c|c|c} \text{Hệ số} & \hat{\beta} & SE & t & p \\ \hline \beta_0 & 21{,}98 & 1{,}95 & 11{,}3 & <0{,}0001 \\ \beta_1\ ([S]) & 1{,}07 & 0{,}102 & 10{,}5 & <0{,}0001 \\ \beta_2\ ([I]) & -0{,}199 & 0{,}083 & -2{,}40 & 0{,}048 \end{array}$$
Đọc: thêm 1 mM cơ chất làm hoạt độ tăng trung bình 1,07 U/mL *khi giữ [I] cố định*; thêm 1 µM chất ức chế làm giảm 0,199 U/mL *khi giữ [S] cố định* — đây là hai hiệu ứng riêng phần, không phải tương quan từng cặp. Cả mô hình: $R^2 = 0{,}961$, $R^2_{\text{adj}} = 0{,}949$, $F_{2,7} = 85{,}3$, $p = 1{,}2\times10^{-5}$, $s = 0{,}63$ U/mL. Hệ số chặn 21,98 nằm ngoài miền dữ liệu ($[S]=0$, $[I]=0$) — không nên diễn giải.
```

### R² điều chỉnh và cạm bẫy thêm biến

R² luôn tăng khi thêm biến — kể cả biến vô nghĩa — vì mô hình có thêm bậc tự do để khớp nhiễu. R² điều chỉnh trừ phạt:

```definition[R² điều chỉnh]
$$R^2_{\text{adj}} = 1 - \frac{SS_{res}/(n-p-1)}{SS_{tot}/(n-1)} = 1 - (1-R^2)\frac{n-1}{n-p-1}.$$
Nó chỉ tăng khi biến thêm vào giải thích đủ biến thiên để bù phạt bậc tự do; có thể âm với mô hình tệ.
```

```remark[Biến vô nghĩa: R² tăng, R² điều chỉnh giảm]
Thêm ba biến ngẫu nhiên thuần nhiễu vào mô hình enzyme ở trên: $R^2$ tăng từ 0,961 lên 0,967 (luôn tăng), nhưng $R^2_{\text{adj}}$ giảm từ 0,949 xuống 0,940 — hình phạt bậc tự do đã lộ ra biến thừa. Quy tắc: so sánh mô hình bằng $R^2_{\text{adj}}$ (hoặc AIC), không bằng R².
```

### Cộng tuyến: khi các biến dự đoán "tranh nhau"

Nếu hai biến dự đoán tương quan mạnh, dữ liệu khó tách hiệu ứng riêng của từng biến — hệ số ước lượng trở nên mong manh. Đo lường chuẩn là **hệ số phóng đại phương sai**:

```definition[VIF — variance inflation factor]
$$VIF_j = \frac{1}{1 - R^2_j},$$
trong đó $R^2_j$ là R² của hồi quy $X_j$ lên mọi biến dự đoán khác. Vì $\operatorname{Var}(\hat{\beta}_j) \propto VIF_j$, VIF = 1 nghĩa là không cộng tuyến; VIF &gt; 5–10 là mức báo động. Với ví dụ enzyme: hồi quy $[I]$ lên $[S]$ cho $R^2 = 0{,}54$, nên $VIF_{[I]} = 2{,}2$ — cộng tuyến nhẹ, chấp nhận được.
```

Khi VIF lớn, đừng xoá biến một cách máy móc: cộng tuyến có thể là bản chất của dữ liệu (nồng độ các chất trong cùng một mẫu thường tương quan). Hệ quả đúng đắn là *thừa nhận* độ phân giải hạn chế: khoảng tin cậy của hệ số rộng, và kết luận "biến này không có hiệu ứng" có thể chỉ là "dữ liệu không đủ để tách hiệu ứng này".

### Chẩn đoán: phần dư kể chuyện

Các giả định (quan hệ tuyến tính, phương sai không đổi, phần dư chuẩn, độc lập) được kiểm tra bằng phần dư, không phải bằng R²:

<figure style="margin:1.8em 0;"><img src="/img/stats/regdiag.svg" alt="Chẩn đoán hồi quy" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — (a) Giá trị thực so với dự đoán: các điểm sát đường y = x — mô hình giải thích tốt. (b) Phần dư theo giá trị dự đoán: rải đều quanh 0 trong dải ±2s = ±1,26, không có hình phễu hay đường cong — giả định tuyến tính và phương sai không đổi hợp lý với mẫu này. Với n = 10, kiểm tra bằng mắt, không bằng tỉ lệ điểm ngoài dải.</figcaption></figure>

Một hình phễu (phương sai tăng theo giá trị dự đoán) gợi ý biến đổi log hoặc Box–Cox [^3]; một đường cong gợi ý thiếu số hạng phi tuyến; một điểm tách biệt (leverage cao) cần soi kỹ trước khi xoá.

## Phần B — ANOVA hai yếu tố

### Mô hình có tương tác

ANOVA một yếu tố (Phần 5) giả định mọi nhóm chỉ khác nhau ở trung bình. Với hai yếu tố, câu hỏi mới xuất hiện: hiệu ứng của yếu tố này có *phụ thuộc mức của yếu tố kia* không — tức có **tương tác** không.

```definition[Mô hình ANOVA hai yếu tố, có lặp]
Quan sát $Y_{ijk}$ (lặp thứ $k$ của ô $ij$):
$$Y_{ijk} = \mu + \alpha_i + \beta_j + (\alpha\beta)_{ij} + \varepsilon_{ijk},$$
với $i = 1,\dots,a$ mức của yếu tố A, $j = 1,\dots,b$ mức của yếu tố B, $k = 1,\dots,n$ lần lặp, và các ràng buộc tổng bằng 0 (tổng theo mỗi chỉ số của $\alpha$, $\beta$, $(\alpha\beta)$ đều bằng 0). Số hạng $(\alpha\beta)_{ij}$ là **tương tác**: phần hiệu ứng của ô (i,j) vượt quá dự đoán cộng tính $\mu + \alpha_i + \beta_j$.
```

Phân rã tổng bình phương thành bốn thành phần — mỗi thành phần ứng với một giả thuyết:

$$SS_T = SS_A + SS_B + SS_{AB} + SS_E,$$

với bậc tự do $abn - 1 = (a-1) + (b-1) + (a-1)(b-1) + ab(n-1)$. Dưới các H₀ tương ứng, Cochran cho bốn dạng toàn phương độc lập, mỗi cái chia $\sigma^2$ là $\chi^2$ với đúng bậc tự do đó — nên mọi kiểm định là tỉ số F với mẫu số chung $MS_E$:

```theorem[Kiểm định trong ANOVA hai yếu tố]
$$F_A = \frac{MS_A}{MS_E} \sim F(a-1,\, ab(n-1)), \qquad F_B = \frac{MS_B}{MS_E} \sim F(b-1,\, ab(n-1)),$$
$$F_{AB} = \frac{MS_{AB}}{MS_E} \sim F\bigl((a-1)(b-1),\, ab(n-1)\bigr),$$
với $MS = SS/\text{df}$. Ba kiểm định này trả lời ba câu hỏi độc lập: yếu tố A có hiệu ứng không, yếu tố B có hiệu ứng không, và hiệu ứng của A có phụ thuộc mức của B không.
```

### Ví dụ: nhiệt độ × pH cho hoạt độ enzyme

```example[Hai yếu tố, hai lần lặp]
Hoạt độ enzyme (U/mL) ở 2 nhiệt độ × 3 pH, n = 2 lần lặp mỗi ô:
$$\begin{array}{c|ccc} & \mathrm{pH}\,6 & \mathrm{pH}\,7 & \mathrm{pH}\,8 \\ \hline 25°C & 10,\,12 & 11,\,13 & 12,\,14 \\ 37°C & 14,\,16 & 26,\,30 & 20,\,24 \end{array}$$
Trung bình ô: 11, 12, 13 (25°C) và 15, 28, 22 (37°C); trung bình chung 16,8. Các tổng bình phương:
$$SS_A = 6\bigl[(12{,}0-16{,}8)^2 + (21{,}7-16{,}8)^2\bigr] = 280{,}3,$$
$$SS_B = 4\bigl[(13{,}0-16{,}8)^2 + (20{,}0-16{,}8)^2 + (17{,}5-16{,}8)^2\bigr] = 100{,}7,$$
$$SS_{AB} = 2\sum_{\text{ô}}\bigl(\text{trung bình ô} - \alpha_i - \beta_j + \mu\bigr)^2 = 72{,}7,$$
$$SS_E = 2+2+2+2+8+8 = 24{,}0, \qquad SS_T = 477{,}7.$$
$$\begin{array}{l|c|c|c|c|c} \text{Nguồn} & SS & df & MS & F & p \\ \hline \text{Nhiệt độ (A)} & 280{,}3 & 1 & 280{,}3 & 70{,}1 & 0{,}0002 \\ \text{pH (B)} & 100{,}7 & 2 & 50{,}3 & 12{,}6 & 0{,}007 \\ \text{Tương tác A×B} & 72{,}7 & 2 & 36{,}4 & 9{,}1 & 0{,}015 \\ \text{Sai số} & 24{,}0 & 6 & 4{,}0 & & \\ \text{Tổng} & 477{,}7 & 11 & & & \end{array}$$
So với $F_{0{,}95}(1,6) = 5{,}99$ và $F_{0{,}95}(2,6) = 5{,}14$: cả ba nguồn đều có ý nghĩa — đặc biệt tương tác ($p = 0{,}015$).
```

```remark[Đọc kết quả khi có tương tác]
Tương tác có ý nghĩa nghĩa là kết luận về pH **phải nói riêng cho từng nhiệt độ**: ở 25°C pH hầu như vô can (11 → 12 → 13), còn ở 37°C pH 7 vượt trội (15 → 28 → 22). Nói "pH 7 là tốt nhất" chung chung là sai — và thậm chí trung bình chung của pH 7 (20) che giấu rằng ưu thế chỉ tồn tại ở 37°C. Khi tương tác có ý nghĩa, hiệu ứng chính (main effect) không còn diễn giải được độc lập; phải so sánh trong từng ô (như Tukey HSD của Phần 5, áp dụng trong từng mức yếu tố kia).
```

<figure style="margin:1.8em 0;"><img src="/img/stats/interaction.svg" alt="Đồ thị tương tác" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Đồ thị tương tác: trung bình ô theo pH, mỗi đường là một nhiệt độ. Đường 25°C gần như ngang; đường 37°C nhô lên rõ ở pH 7. Hai đường không song song chính là dấu hiệu hình ảnh của tương tác — và lý do mọi kết luận về pH phải gắn với từng mức nhiệt độ.</figcaption></figure>

### Thiết kế cân bằng và không cân bằng

Phân rã $SS_T = SS_A + SS_B + SS_{AB} + SS_E$ và mọi công thức trên đúng khi **số lặp bằng nhau ở mọi ô** (thiết kế cân bằng) — trường hợp chuẩn của thí nghiệm được thiết kế trước. Với dữ liệu không cân bằng (mất mẫu, số lặp khác nhau), các tổng bình phương không còn trực giao: thứ tự đưa yếu tố vào mô hình thay đổi kết quả (SS loại I, II, III). Thực hành an toàn: thiết kế cân bằng ngay từ đầu; nếu không cân bằng, dùng phần mềm có xử lý đúng (SS loại III) và báo cáo rõ cách tính [^4].

## Phần C — Một mô hình, hai ngôn ngữ

Mối liên hệ đã chạm ở Phần 5 giờ đầy đủ hơn: ANOVA hai yếu tố là hồi quy bội với biến chỉ báo. Với $D$ là biến chỉ báo nhiệt độ 37°C, $E_1, E_2$ chỉ báo pH 7 và pH 8, mô hình

$$Y = \beta_0 + \beta_1 D + \beta_2 E_1 + \beta_3 E_2 + \gamma_1 D\!\cdot\!E_1 + \gamma_2 D\!\cdot\!E_2 + \varepsilon$$

tái tạo chính xác mô hình ANOVA hai yếu tố: $\beta_1$ là hiệu ứng chính nhiệt độ, $\beta_2, \beta_3$ là hiệu ứng pH, và các **số hạng tích** $D\!\cdot\!E_j$ chính là tương tác — kiểm định $F_{AB}$ là kiểm định $\gamma_1 = \gamma_2 = 0$. Tương ứng ba chiều: hồi quy với một biến liên tục là "ANOVA" của mô hình có độ dốc; ANOVA là hồi quy với biến phân loại; tương tác trong ANOVA là số hạng tích trong hồi quy. Nắm được một máy là nắm được cả ba — và mở đường tới mô hình tuyến tính tổng quát (GLM) [^5], nơi cùng khung này xử lý phản hồi nhị phân, đếm và tỉ lệ.

## Cạm bẫy thực hành

1. **Ngoại suy.** $\hat{y} = 21{,}98 + 1{,}07[S] - 0{,}199[I]$ chỉ hợp lệ trong dải $[S] \in [1,10]$, $[I] \in [22,34]$ đã khảo sát — bên ngoài, quan hệ có thể đổi dấu (bão hoà enzyme, độc tính). Mọi dự đoán phải kèm miền dữ liệu.
2. **Overfitting.** Thêm biến không có cơ sở sinh học làm R² tăng nhưng dự đoán kém đi với dữ liệu mới; dùng R² điều chỉnh/AIC và cross-validation, không dùng R².
3. **Cộng tuyến đánh lừa.** Hai biến tương quan mạnh cho hệ số "không có ý nghĩa" từng cái dù cả hai quan trọng — đừng vội xoá; kiểm tra VIF và báo cáo độ phân giải thực của dữ liệu.
4. **Bỏ quên tương tác.** Chạy "hai yếu tố, không tương tác" khi tương tác tồn tại sẽ gộp $SS_{AB}$ vào sai số: làm giảm công suất và cho kết luận main effect sai lệch. Luôn vẽ đồ thị tương tác trước khi đọc bảng.
5. **Thiết kế mất cân bằng.** Mất mẫu làm các kiểm định phụ thuộc thứ tự; xử lý đúng (SS loại III) và báo cáo trung bình ô kèm cỡ mẫu.
6. **Giả định phần dư.** Chuẩn, phương sai không đổi, độc lập — kiểm tra bằng đồ thị phần dư như Hình 2; nếu sai, biến đổi dữ liệu (log, Box–Cox [^3]) hoặc dùng phương pháp bền vững.

## Lộ trình tiếp theo

Hai phần gần nhất đã hoàn tất bức tranh "mô hình tuyến tính": hệ số, phân phối, kiểm định (Phần 5–6). Để đi tiếp: (1) sách thực hành chuẩn của Cohen và đồng nghiệp [^6] cho hồi quy bội; (2) Snedecor & Cochran [^4] cho ANOVA và thiết kế thí nghiệm; (3) Box & Cox [^3] cho biến đổi dữ liệu; (4) GLM của Nelder–Wedderburn [^5] cho phản hồi phi chuẩn — logistic cho dữ liệu dương/âm, Poisson cho số đếm (nối thẳng với Phần 2), là bước tự nhiên tiếp theo của loạt bài, đặc biệt hữu ích cho người làm sinh học phân tử và độc học.

[^1]: A.-M. Legendre, *Nouvelles méthodes pour la détermination des orbites des comètes*, 1805; C. F. Gauss, *Theoria motus corporum coelestium*, 1809.
[^2]: Định lý Gauss–Markov: xem C. R. Rao, *Linear Statistical Inference and Its Applications*, 2nd ed., Wiley, 1973.
[^3]: G. E. P. Box and D. R. Cox, "An analysis of transformations," *Journal of the Royal Statistical Society B* 26(2): 211–252, 1964.
[^4]: G. W. Snedecor and W. G. Cochran, *Statistical Methods*, 8th ed., Iowa State University Press, 1989.
[^5]: J. A. Nelder and R. W. M. Wedderburn, "Generalized linear models," *Journal of the Royal Statistical Society A* 135(3): 370–384, 1972.
[^6]: J. Cohen, P. Cohen, S. G. West and L. S. Aiken, *Applied Multiple Regression/Correlation Analysis for the Behavioral Sciences*, 3rd ed., Lawrence Erlbaum, 2003.
