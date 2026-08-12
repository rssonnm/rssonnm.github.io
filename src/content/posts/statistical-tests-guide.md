---
title: "Lựa chọn kiểm định thống kê"
date: 2026-08-11T06:00:00
description: "Trình bày tiêu chí và quy trình lựa chọn kiểm định thống kê cho nghiên cứu thực nghiệm. Nội dung gồm bộ máy chung của kiểm định giả thuyết, bản đồ quyết định bảy câu hỏi, các họ kiểm định tham số và phi tham số, kiểm định tỉ lệ và bảng số, tương quan, cùng những sai lầm thường gặp. Mỗi phương pháp có ví dụ tính tay với số liệu thực, một số kết quả được kiểm chứng bằng mô phỏng."
topic: mathematics
tags: [statistics, hypothesis-testing, p-value, t-test, anova, nonparametric, chi-square, fisher-exact, decision-tree, tutorial]
featured: true
draft: false
---

Kiểm định thống kê là một công cụ của suy luận quy nạp: từ một mẫu hữu hạn, nó đưa ra một kết luận có kiểm soát sai số về quần thể. Việc lựa chọn phương pháp không phải là vấn đề sở thích. Một kiểm định dùng sai giả định cho kết luận sai, và tệ hơn, một kết luận sai có vẻ chính xác: mức ý nghĩa công bố không còn tương ứng với xác suất thực của sai lầm loại I. Bài viết này đưa ra một bản đồ lựa chọn. Nội dung gồm bốn phần: bộ máy chung của kiểm định, bản đồ quyết định, các họ phương pháp với ví dụ số, và các bẫy thường gặp. Các ví dụ được tính tay với số thật. Các công thức được chứng minh hoặc dẫn giải ở mức cần thiết.

## Phần A — Bộ máy chung của kiểm định

Các kiểm định khác nhau về tên gọi, nhưng cấu trúc chung là một. Hiểu cấu trúc này trước, bản đồ ở Phần B trở nên trực tiếp.

```definition[Giả thuyết không và đối thuyết]
Kiểm định bắt đầu từ một cặp giả thuyết loại trừ nhau. Giả thuyết không $H_0$ khẳng định không có hiệu ứng: hai trung bình bằng nhau, hệ số tương quan bằng 0, dữ liệu tuân theo một phân phối xác định. Đối thuyết $H_1$ phủ định $H_0$.

$H_0$ là một mệnh đề chính xác về tham số ($\mu = \mu_0$, $\mu_1 = \mu_2$), còn $H_1$ là một vùng ($\mu \neq \mu_0$). Kiểm định không bao giờ chứng minh $H_0$. Nó chỉ cho biết dữ liệu có đủ bằng chứng để bác bỏ $H_0$ hay không.
```

```definition[p-value]
Gọi $T$ là thống kê kiểm định, chẳng hạn $t$, $F$, $\chi^2$, $U$ hoặc $W$, tính từ dữ liệu. Dưới giả thuyết $H_0$, $T$ có phân phối null xác định. p-value là xác suất, nếu $H_0$ đúng, nhận được một giá trị $T$ cực đoan hơn hoặc bằng giá trị quan sát:
$$p = P(T \ge T_{\text{obs}} \mid H_0).$$
p-value không phải xác suất $H_0$ đúng và không phải xác suất kết luận sai. Nó trả lời một câu hỏi duy nhất: dữ liệu quan sát bất thường đến mức nào nếu $H_0$ đúng.
```

```definition[Sai lầm loại I, loại II và công suất]
Sai lầm loại I, mức $\alpha$ thường lấy 0,05, là việc bác bỏ $H_0$ khi $H_0$ đúng. Sai lầm loại II, ký hiệu $\beta$, là việc không bác bỏ $H_0$ khi $H_1$ đúng. Công suất $1 - \beta$ là xác suất phát hiện hiệu ứng khi hiệu ứng tồn tại.

Công suất phụ thuộc bốn đại lượng: cỡ hiệu ứng $\delta$, cỡ mẫu $n$, mức $\alpha$ và độ phân tán $\sigma$. Thiết kế nghiên cứu là bài toán cân bằng giữa các đại lượng này.
```

```lemma[p phân bố đều dưới H0]
Nếu $H_0$ đúng và $T$ có phân phối null liên tục, p-value phân bố đều trên $(0,1)$.

*Chứng minh.* Gọi $F$ là hàm phân phối của $T$ dưới $H_0$. Theo phép biến đổi tích phân xác suất, $F(T) \sim U(0,1)$. Vì $p = 1 - F(T)$ là một biến đổi đơn điệu giảm, tính đều được bảo toàn. $\blacksquare$

Hệ quả: nếu quy trình đúng, đúng 5% các thí nghiệm cho $p < 0{,}05$ khi $H_0$ đúng. Bất kỳ thủ tục nào làm p không còn phân bố đều, chẳng hạn dừng sớm, chọn kiểm định sau khi quan sát dữ liệu, hoặc so sánh bội, đều phá vỡ ý nghĩa của p-value.
```

```remark[Năm đại lượng của một thiết kế]
Một thiết kế kiểm định được xác định bởi năm đại lượng: $\alpha$, $\beta$ hoặc công suất, cỡ hiệu ứng $\delta$, cỡ mẫu $n$ và độ phân tán $\sigma$. Cho bốn đại lượng, đại lượng thứ năm được xác định. Quy tắc thực hành: chọn kiểm định, mức $\alpha$ và cỡ mẫu trước khi thu dữ liệu. Kiểm định chọn sau khi quan sát dữ liệu làm lệch phân phối của p-value, theo Lemma trên.
```

## Phần B — Bản đồ quyết định

```remark[Bảy câu hỏi có thứ tự]
Việc lựa chọn kiểm định thu về bảy câu hỏi có thứ tự.

1. **Loại dữ liệu.** Dữ liệu liên tục, thứ bậc hay phân loại (đếm, tỉ lệ)?
2. **Mục tiêu.** So sánh nhóm, so với hằng số, hay đo mối liên hệ?
3. **Số nhóm.** Một, hai hay nhiều hơn hai? Với nhiều hơn hai, dùng ANOVA hoặc Kruskal–Wallis một bước thay vì nhiều kiểm định t (Phần G).
4. **Cấu trúc.** Ghép cặp hay độc lập? Cùng đơn vị đo trước và sau là ghép cặp.
5. **Tính chuẩn.** Dữ liệu có chuẩn không? Kiểm tra bằng Q-Q plot và Shapiro–Wilk (Phần F). Với $n$ lớn, định lý giới hạn trung tâm bù cho độ lệch chuẩn nhẹ.
6. **Đồng nhất phương sai.** Phương sai các nhóm có bằng nhau không? Nếu không, dùng Welch thay cho Student (Phần C).
7. **Cỡ mẫu.** Cỡ mẫu có đủ công suất không? Tính trước khi thu dữ liệu (Phần G).
```

<figure style="margin:1.8em 0;"><img src="/img/stats/decision-tree.svg" alt="Bản đồ chọn kiểm định thống kê" style="display:block;width:100%;max-width:680px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Bản đồ quyết định. Teal: câu hỏi. Vàng: điều kiện cần kiểm tra. Xanh: kiểm định tham số. Đỏ: kiểm định phi tham số. Xám: nhánh dữ liệu. Thứ tự từ trên xuống: loại dữ liệu, mục tiêu, số nhóm, cấu trúc, tính chuẩn, phương sai.</figcaption></figure>

```remark[Lựa chọn tham số và phi tham số]
Dùng kiểm định tham số khi giả định đứng vững, kiểm định phi tham số khi nghi ngờ giả định. Chi phí của việc chọn phi tham số khi dữ liệu chuẩn là nhỏ: hiệu quả tương đối tiệm cận của Mann–Whitney U so với t-test là 0,955, tức mất khoảng 4,5% công suất. Chi phí của việc chọn tham số khi dữ liệu không đáp ứng giả định có thể lớn. Hình 2 định lượng điều này. Với dữ liệu chuẩn, hai đường công suất gần như trùng nhau. Với dữ liệu nhiễm bẩn, 8% ngoại lai, công suất của t-test ở $n = 50$ là 0,30, của Mann–Whitney là 0,57.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/power-tests.svg" alt="Công suất t-test so với Mann-Whitney" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Công suất của t-test (teal) và Mann–Whitney U (vàng) theo n; hiệu 0,5σ, α = 0,05, mô phỏng 1500 lần mỗi điểm. (a) Dữ liệu chuẩn: hai đường gần như trùng nhau. (b) Dữ liệu nhiễm bẩn 8% ngoại lai: Mann–Whitney vượt rõ rệt.</figcaption></figure>

## Phần C — Kiểm định tham số

```example[t một mẫu: hiệu chuẩn máy đo pH]
Xét bài toán hiệu chuẩn. Máy đo pH được kiểm tra bằng dung dịch chuẩn pH 7,00. Tám phép đo: 6,98, 7,04, 7,01, 6,99, 7,03, 7,00, 7,02, 6,97. Giả thuyết $H_0$: $\mu = 7{,}00$. Các đại lượng:
$$\bar{x} = 7{,}005,\qquad s = 0{,}0245,\qquad t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}} = \frac{0{,}005}{0{,}00866} = 0{,}577,\ \text{df} = 7,\ p = 0{,}582.$$
Giá trị p lớn: dữ liệu không cho bằng chứng máy lệch. Cần phân biệt "không bác bỏ $H_0$" với "$H_0$ đúng". Độ lệch 0,005 nằm trong phạm vi dao động ngẫu nhiên của tám phép đo; điều này không loại trừ một độ lệch nhỏ hơn ngưỡng phát hiện của mẫu.
```

```example[Welch t khi phương sai lệch]
Xét hai nhóm hoạt độ enzyme: nhóm 1, $n_1 = 12$, $s_1 = 0{,}5$; nhóm 2, $n_2 = 6$, $s_2 = 1{,}5$. Tỉ số phương sai là 9. Kiểm định Welch không gộp phương sai; sai số chuẩn là
$$\text{SE} = \sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}} = \sqrt{\frac{0{,}25}{12} + \frac{2{,}25}{6}} = 0{,}629,\qquad t = \frac{10{,}5 - 10{,}0}{0{,}629} = 0{,}795.$$
Bậc tự do Welch–Satterthwaite:
$$\text{df} = \frac{\bigl(\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}\bigr)^2}{\frac{(s_1^2/n_1)^2}{n_1-1} + \frac{(s_2^2/n_2)^2}{n_2-1}} = \frac{0{,}3958^2}{\frac{0{,}0208^2}{11} + \frac{0{,}375^2}{5}} = 5{,}56,$$
$p = 0{,}459$. Kiểm định Student gộp phương sai cho df = 16 và $t = 1{,}069$ ($p = 0{,}301$). Sự khác biệt giữa hai kết quả không phải là lợi thế của Student; nó phản ánh việc vi phạm giả định đồng nhất phương sai, như mô phỏng dưới đây cho thấy.
```

Kiểm định Welch và bậc tự do Welch–Satterthwaite do Welch giới thiệu [^1].

```remark[Sai lầm loại I của Student khi phương sai lệch]
Mô phỏng 20 000 thí nghiệm với $H_0$ đúng: $n_1 = 30$, $\sigma_1 = 1$; $n_2 = 10$, $\sigma_2 = 4$. Phương sai lớn đặt ở nhóm nhỏ, một cấu hình phổ biến trong thực nghiệm. Tỉ lệ bác bỏ:
$$\text{Student t: } 24{,}4\%,\qquad \text{Welch t: } 5{,}2\%.$$
Student t phạm sai lầm loại I gấp khoảng 5 lần mức $\alpha$ công bố; Welch giữ đúng mức 5%. Không có lý do thực hành nào để chọn Student thay cho Welch khi so sánh hai nhóm độc lập. Khi phương sai lớn nằm ở nhóm lớn, Student trở nên bảo thủ quá mức và bỏ sót hiệu ứng.
```

```example[t ghép cặp: glucose trước và sau]
Nồng độ glucose (mM) của tám con chuột đo trước và sau can thiệp. Hiệu số: 1,2, 0,8, 1,5, 0,9, 1,1, 0,7, 1,3, 1,0.
$$\bar{d} = 1{,}0625,\qquad s_d = 0{,}2669,\qquad t = \frac{\bar{d}}{s_d/\sqrt{n}} = \frac{1{,}0625}{0{,}0944} = 11{,}26,\ \text{df} = 7,\ p = 0{,}00001.$$
Kiểm định t ghép cặp là kiểm định t một mẫu trên hiệu số. Nó loại bỏ khác biệt giữa các chủ thể và chỉ giữ dao động trong từng cặp. Vì vậy thiết kế ghép cặp thường có công suất cao hơn thiết kế hai nhóm độc lập cùng cỡ mẫu.
```

```remark[ANOVA và giả định của họ tham số]
Với nhiều hơn hai nhóm độc lập, kiểm định đúng là ANOVA một yếu tố, $F = \text{MSB}/\text{MSW}$ với phân phối F, df $= (k-1,\, kn-k)$. Ví dụ tính tay với $F = 32{,}0$ và $p \approx 8\times10^{-5}$ có ở Phần 5 của loạt bài. Ba giả định của họ tham số: chuẩn, đồng nhất phương sai, độc lập.

Hai nhận xét thực hành. Thứ nhất, t-test bền với vi phạm tính chuẩn khi $n$ đủ lớn, vì định lý giới hạn trung tâm làm trung bình tiến tới chuẩn. Thứ hai, nguyên nhân chính làm họ tham số thất bại không phải độ lệch chuẩn nhẹ mà là ngoại lai và phương sai lệch nặng; đây là hai trường hợp phi tham số xử lý tốt.
```

## Phần D — Kiểm định phi tham số

Các kiểm định phi tham số làm việc trên thứ hạng hoặc dấu, không trên giá trị. Chúng không giả định phân phối cụ thể và bền với ngoại lai. Chúng kiểm định sự khác nhau của phân phối, không phải của trung bình; trong thực hành kết quả thường được diễn giải là khác trung vị.

```example[Sign test]
Mười cặp quan sát trước và sau, tám tăng, hai giảm. Dưới $H_0$, số lần tăng $X \sim \text{Binomial}(10;\, 0{,}5)$:
$$p = P(X \ge 8) = \frac{\binom{10}{8}+\binom{10}{9}+\binom{10}{10}}{2^{10}} = \frac{45+10+1}{1024} = 0{,}0547,\qquad \text{hai phía: } 0{,}109.$$
Giá trị này không đủ nhỏ để bác bỏ $H_0$. Sign test chỉ dùng dấu của hiệu số; nó bỏ toàn bộ thông tin về độ lớn. Kết quả trùng với kiểm định binomial cho tỉ lệ ở Phần E: hai kiểm định là một.
```

```example[Wilcoxon signed-rank]
Kiểm định Wilcoxon giữ độ lớn qua thứ hạng. Với các hiệu số +1,2, +0,8, −0,5, +0,9, +1,1, +0,7, −0,3, +1,3, +1,0, +0,2, xếp hạng theo $|d|$: 0,2→1, 0,3→2, 0,5→3, 0,7→4, 0,8→5, 0,9→6, 1,0→7, 1,1→8, 1,2→9, 1,3→10. Tổng hạng của hiệu dương $W_+ = 1+4+5+6+7+8+9+10 = 50$; tổng hạng của hiệu âm $W_- = 2+3 = 5$. Thống kê:
$$W = \min(W_+, W_-) = 5,\qquad p = 0{,}0195\ (\text{chính xác, hai phía}).$$
Với cùng dữ liệu, sign test cho $p = 0{,}109$, Wilcoxon cho $p = 0{,}0195$. Lý do: hai hiệu số âm (0,3 và 0,5) là hai hiệu số nhỏ nhất, còn các hiệu số dương đều lớn. Wilcoxon phản ánh cấu trúc này, sign test thì không.
```

Kiểm định Wilcoxon (1945) [^2] là lựa chọn chuẩn cho dữ liệu ghép cặp khi tính chuẩn bị nghi ngờ.

```example[Mann–Whitney U]
Hai nhóm giá trị: A = 3,2, 3,5, 3,9, 4,2; B = 2,4, 2,7, 2,9, 3,0, 3,3. Gộp và xếp hạng từ 1 đến 9. Nhóm A chiếm hạng 5, 7, 8, 9, tổng $R_A = 29$. Thống kê:
$$U_1 = n_1 n_2 + \frac{n_1(n_1+1)}{2} - R_A = 20 + 10 - 29 = 1,\qquad U = \min(U_1,\, n_1 n_2 - U_1) = 1,$$
$$p = 0{,}0317\ (\text{chính xác, hai phía}).$$
Giá trị p được tính bằng cách đếm mọi cách phân bố bốn hạng cho nhóm A trong chín hạng. Mann–Whitney so sánh phân phối, không so trung bình: hai nhóm cùng trung vị nhưng phân tán khác nhau vẫn có thể cho p nhỏ.
```

Thống kê U do Mann và Whitney đề xuất năm 1947 [^3].

```remark[Kruskal–Wallis, Friedman, kiểm định hoán vị]
Kruskal–Wallis là mở rộng của Mann–Whitney cho k nhóm độc lập: xếp hạng toàn bộ dữ liệu, so sánh tổng hạng của các nhóm, phân phối xấp xỉ $\chi^2$ với df $= k-1$. Friedman là bản ghép cặp của Kruskal–Wallis cho thiết kế khối ngẫu nhiên đầy đủ.

Kiểm định hoán vị không cần phân phối xấp xỉ. Dưới $H_0$, mọi cách gán nhãn nhóm cho dữ liệu đều như nhau, do đó p là tỉ lệ các hoán vị cho thống kê cực đoan hơn quan sát. Phương pháp này chính xác với mọi n; chi phí tính toán không còn là trở ngại.
```

Thống kê Kruskal–Wallis do Kruskal và Wallis giới thiệu năm 1952 [^4].

## Phần E — Kiểm định tỉ lệ và bảng số

```example[Kiểm định χ² khớp phân phối: Hardy–Weinberg]
Một quần thể 100 cá thể có kiểu gen AA = 60, Aa = 30, aa = 10. Câu hỏi: tỉ lệ này có phù hợp cân bằng Hardy–Weinberg không. Tần số allele ước lượng $p_A = (2\cdot 60 + 30)/200 = 0{,}75$. Dưới cân bằng Hardy–Weinberg, kỳ vọng: AA = 100·0,75² = 56,25; Aa = 100·2·0,75·0,25 = 37,5; aa = 100·0,25² = 6,25. Thống kê $\chi^2$:
$$\chi^2 = \frac{(60-56{,}25)^2}{56{,}25} + \frac{(30-37{,}5)^2}{37{,}5} + \frac{(10-6{,}25)^2}{6{,}25} = 0{,}25 + 1{,}50 + 2{,}25 = 4{,}00.$$
Bậc tự do: ba ô, trừ một cho ràng buộc tổng, trừ một cho tham số $p_A$ ước lượng từ dữ liệu; df = 1. Với df = 1, $p = P(\chi^2_1 \ge 4) = 0{,}046$. Kết luận ở mức 5%: quần thể lệch cân bằng Hardy–Weinberg. Nếu bỏ qua bậc tự do của tham số ước lượng, df = 2, thì $p \approx 0{,}135$ và kết luận đảo ngược. Đây là một lỗi bậc tự do kinh điển.
```

Thống kê $\chi^2$ do Pearson giới thiệu năm 1900 [^5].

<figure style="margin:1.8em 0;"><img src="/img/stats/chi2-gof.svg" alt="Kiểm định chi bình phương Hardy-Weinberg" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Quan sát (teal) và kỳ vọng Hardy–Weinberg (vàng). Thiếu cá thể dị hợp Aa, thừa AA và aa. χ² = 4,00, df = 1, p = 0,046.</figcaption></figure>

```example[χ² bảng liên hợp và kiểm định chính xác Fisher]
Với bảng liên hợp k hàng, r cột, $\chi^2 = \sum (O-E)^2/E$ có df $= (k-1)(r-1)$, hợp lệ khi các ô kỳ vọng không nhỏ hơn 5. Khi kỳ vọng nhỏ, xấp xỉ $\chi^2$ không còn đáng tin. Kiểm định chính xác Fisher tính xác suất siêu bội của bảng quan sát cộng các bảng cực đoan hơn. Xét bảng điều trị × đột biến (1, 9)/(5, 5):
$$p = \frac{10!\cdot 10!\cdot 6!\cdot 14!}{20!\cdot 1!\cdot 9!\cdot 5!\cdot 5!} + \frac{10!\cdot 10!\cdot 6!\cdot 14!}{20!\cdot 0!\cdot 10!\cdot 6!\cdot 4!} = 0{,}0650 + 0{,}0054 = 0{,}070.$$
Tỉ lệ đột biến 1/10 so với 5/10 không đủ bằng chứng với n = 20. Với bảng (0, 10)/(5, 5), $p = 0{,}016$. Với bảng nhỏ, không dùng $\chi^2$; phải đếm chính xác.
```

Phương pháp này do Fisher phát triển [^6].

```remark[McNemar cho bảng ghép cặp]
Khi hai quan sát phân loại thuộc cùng một đơn vị, chẳng hạn trước và sau điều trị trên cùng bệnh nhân, các ô của bảng $2\times2$ không độc lập và $\chi^2$ thường không đúng. Kiểm định McNemar chỉ dùng các cặp bất hoà $b$ và $c$ của bảng $\begin{smallmatrix}a&b\\c&d\end{smallmatrix}$: dưới $H_0$ hai ô này cân bằng, $\chi^2 = (|b-c|-1)^2/(b+c)$, df = 1. Đây là bản ghép cặp của $\chi^2$, tương tự quan hệ giữa t ghép cặp và t hai mẫu ở Phần C.
```

## Phần F — Tương quan và tính chuẩn

```example[Pearson và Spearman]
Pearson r đo liên hệ tuyến tính. Spearman $\rho$ đo liên hệ đơn điệu; nó là Pearson tính trên thứ hạng. Xét dữ liệu $y = 2^x$ với $x = 1, \ldots, 8$. Quan hệ đơn điệu hoàn hảo nhưng không tuyến tính:
$$r = 0{,}850,\qquad \rho = 1{,}000.$$
$\rho = 1$ vì thứ hạng của y tăng đúng theo thứ hạng của x; $r < 1$ vì đường cong. Khi kết luận có dạng "x càng lớn thì y càng lớn", dùng Spearman. Khi cần hệ số góc, dùng Pearson, và vẽ dữ liệu trước: ngoại lai cực đoan làm r sụp đổ, còn Spearman bền hơn nhưng không miễn nhiễm.
```

```remark[Kiểm tra tính chuẩn]
Q-Q plot là phương pháp kiểm tra tính chuẩn đáng tin nhất. Nó vẽ định lượng mẫu theo định lượng lý thuyết của phân phối chuẩn. Dữ liệu chuẩn cho một đường thẳng, dữ liệu lệch cho đường cong lên, dữ liệu đuôi nặng cho hình chữ S (Hình 4). Kiểm định Shapiro–Wilk cho một con số, nhưng yếu với n nhỏ, bỏ sót độ lệch, và quá nhạy với n lớn, phát hiện cả độ lệch không đáng kể. Dùng Q-Q làm chẩn đoán chính và Shapiro–Wilk làm xác nhận.

Với n lớn, định lý giới hạn trung tâm cho phép t-test chịu độ lệch nhẹ. Quyết định tham số hay phi tham số nên dựa trên mức độ lệch và sự hiện diện của ngoại lai, không phải trên một ngưỡng p cứng nhắc.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/qq-normality.svg" alt="Q-Q plots cho dữ liệu chuẩn, lệch và đuôi nặng" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Q-Q plots, 40 điểm, đường đứt là tham chiếu tuyến tính. (a) Dữ liệu chuẩn: điểm nằm sát đường thẳng. (b) Log-normal: cong lên, lệch phải. (c) Phân phối t với 3 bậc tự do: hình chữ S, đuôi nặng. Hình dạng là thông điệp chính, không phải một con số.</figcaption></figure>

## Phần G — Bẫy và báo cáo

```example[So sánh bội]
Sáu nhóm tạo ra 15 cặp so sánh. Nếu chạy 15 kiểm định t ở mức $\alpha = 0{,}05$, xác suất có ít nhất một kết luận sai khi mọi $H_0$ đúng là
$$1 - 0{,}95^{15} = 0{,}537.$$
Hơn một nửa các nghiên cứu như vậy phát hiện một hiệu ứng không tồn tại. Ba cách xử lý. Thứ nhất, dùng ANOVA một bước thay vì nhiều kiểm định t. Thứ hai, nếu phải so cặp, dùng Tukey HSD, kiểm soát tỉ lệ sai toàn cục, tính tay ở Phần 5, hoặc hiệu chỉnh Bonferroni $\alpha/k = 0{,}0033$ cho 15 cặp. Thứ ba, khi quét hàng nghìn phép kiểm định, kiểm soát tỉ lệ phát hiện sai FDR (false discovery rate).
```

Thủ tục FDR do Benjamini và Hochberg đề xuất [^7].

```definition[Effect size và cỡ mẫu]
p-value không cho biết độ lớn của hiệu ứng. Effect size chuẩn hoá cho hai trung bình là Cohen d $= (\mu_1-\mu_2)/\sigma$; cho ANOVA là $\eta^2 = \text{SSB}/\text{SST}$. Cỡ mẫu cho hai nhóm, công suất 80%, $\alpha = 0{,}05$ hai phía:
$$n \approx \frac{2\,(z_{\alpha/2} + z_\beta)^2}{d^2} = \frac{2\,(1{,}96 + 0{,}84)^2}{d^2}.$$
Với $d = 0{,}5$, $n \approx 63$ mỗi nhóm. Với $d = 0{,}2$, $n \approx 393$. Với $n = 10$ mỗi nhóm, chỉ hiệu ứng lớn, $d \approx 1{,}3$, có cơ hội được phát hiện. Cỡ mẫu phải được tính trước khi thu dữ liệu.
```

Phân loại $d = 0{,}2/0{,}5/0{,}8$, nhỏ/vừa/lớn, theo Cohen (1988) [^8].

```remark[Báo cáo]
Bốn quy tắc báo cáo.

Thứ nhất, "không có ý nghĩa" không có nghĩa "bằng nhau". Nó có thể phản ánh công suất thấp. Để khẳng định tương đương, dùng kiểm định tương đương (TOST).

Thứ hai, p nhỏ không có nghĩa hiệu ứng lớn. Với n lớn, mọi khác biệt nhỏ đều trở thành "có ý nghĩa". Báo cáo effect size và khoảng tin cậy cùng với p.

Thứ ba, dừng sớm và soi dữ liệu phá vỡ phân phối của p-value. Mô phỏng ở Phần 5 của loạt bài cho tỉ lệ dương tính giả 36% khi dừng kiểm định ở $p < 0{,}05$, thay vì 5%. Chọn kiểm định và cỡ mẫu trước; đăng ký trước (pre-registration) khi có thể.

Thứ tư, khi nghi ngờ, tham vấn chuyên gia thống kê trước khi thu dữ liệu.
```

Bảng tóm tắt sau đây tóm lược toàn bộ bản đồ:

| Câu hỏi của bạn | Dữ liệu | Kiểm định tham số | Kiểm định phi tham số |
|---|---|---|---|
| 1 nhóm so với hằng số | liên tục | t một mẫu | Wilcoxon signed-rank, sign test |
| 2 nhóm độc lập | liên tục, chuẩn, đồng nhất | Student t (hoặc Welch) | Mann–Whitney U |
| 2 nhóm độc lập | liên tục, phương sai lệch | Welch t | Mann–Whitney U |
| 2 nhóm ghép cặp | liên tục | t ghép cặp | Wilcoxon signed-rank |
| > 2 nhóm độc lập | liên tục | ANOVA (Welch nếu lệch) | Kruskal–Wallis |
| > 2 nhóm ghép cặp | liên tục | ANOVA đo lặp | Friedman |
| Tỉ lệ một mẫu | đếm | z tỉ lệ (n lớn) | binomial chính xác |
| Bảng k×r (độc lập) | đếm | χ² (kỳ vọng ≥ 5) | Fisher chính xác (bảng nhỏ) |
| Bảng 2×2 ghép cặp | đếm | — | McNemar |
| Liên hệ 2 biến | liên tục / thứ bậc | Pearson r | Spearman ρ |

## Lộ trình tiếp theo

Bài viết này là bản đồ. Chi tiết của từng phương pháp có trong mười một phần của loạt bài *Thống kê cơ bản cho khoa học sự sống*: phân phối mẫu và định lý giới hạn trung tâm (Phần 3), kiểm định giả thuyết (Phần 5), ANOVA và hồi quy (Phần 6), GLM (Phần 7), mô hình hỗn hợp (Phần 8). Tài liệu tham khảo: Siegel và Castellan [^9] về phi tham số, Zar [^10] về sinh thống kê, Cohen [^8] về phân tích công suất, Lehmann và Romano về lý thuyết kiểm định.

[^1]: B. L. Welch, "The generalization of 'Student's' problem when several different population variances are involved," *Biometrika* 34(1–2): 28–35, 1947.
[^2]: F. Wilcoxon, "Individual comparisons by ranking methods," *Biometrics Bulletin* 1(6): 80–83, 1945.
[^3]: H. B. Mann and D. R. Whitney, "On a test of whether one of two random variables is stochastically larger than the other," *Annals of Mathematical Statistics* 18(1): 50–60, 1947.
[^4]: W. H. Kruskal and W. A. Wallis, "Use of ranks in one-criterion variance analysis," *Journal of the American Statistical Association* 47(260): 583–621, 1952.
[^5]: K. Pearson, "On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling," *Philosophical Magazine* 50(302): 157–175, 1900.
[^6]: R. A. Fisher, "The logic of inductive inference," *Journal of the Royal Statistical Society* 98(1): 39–82, 1935.
[^7]: Y. Benjamini and Y. Hochberg, "Controlling the false discovery rate: a practical and powerful approach to multiple testing," *Journal of the Royal Statistical Society B* 57(1): 289–300, 1995.
[^8]: J. Cohen, *Statistical Power Analysis for the Behavioral Sciences*, 2nd ed., Lawrence Erlbaum, 1988.
[^9]: S. Siegel and N. J. Castellan, *Nonparametric Statistics for the Behavioral Sciences*, 2nd ed., McGraw-Hill, 1988.
[^10]: J. H. Zar, *Biostatistical Analysis*, 5th ed., Prentice Hall, 2010.
