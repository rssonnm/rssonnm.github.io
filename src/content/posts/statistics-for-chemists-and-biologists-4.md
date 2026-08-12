---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 4: Lan truyền sai số"
date: 2026-08-10T14:00:00
description: "Kết quả cuối cùng của một thí nghiệm hầu như luôn là hàm số của nhiều phép đo: nồng độ từ thể tích và khối lượng, pH từ hoạt độ ion, hiệu suất từ hai phép cân. Bài viết này xây dựng công thức lan truyền sai số từ khai triển Taylor bậc một — phương sai của kết quả là tổng các phương sai thành phần nhân với bình phương đạo hàm — rồi áp dụng vào năm tình huống thực tế của hoá phân tích: chuẩn độ, pH, pha loãng nối tiếp, trừ blank và suy ngược từ đường chuẩn hồi quy; kèm kiểm chứng bằng mô phỏng Monte Carlo."
topic: mathematics
tags: [statistics, error-propagation, uncertainty, analytical-chemistry, measurement, tutorial]
featured: false
draft: false
---

Ba phần trước trả lời: dữ liệu mô tả thế nào (Phần 1), dữ liệu là biến ngẫu nhiên ra sao (Phần 2), và vì sao suy luận được từ mẫu (Phần 3). Phần này trả lời câu hỏi thực hành nhất: **kết quả cuối cùng của thí nghiệm là một hàm số của nhiều phép đo — sai số của nó đến từ đâu và cộng lại thế nào?**

Nồng độ chuẩn độ $C_2 = C_1V_1/V_2$ phụ thuộc ba phép đo (nồng độ chất chuẩn, thể tích pipette, thể tích burette); pH phụ thuộc hoạt độ ion đo được; hiệu suất phản ứng là tỉ số của hai phép cân; nồng độ suy ra từ đường chuẩn hồi quy phụ thuộc toàn bộ dãy chuẩn. Mỗi phép đo thành phần là một biến ngẫu nhiên (Phần 2) — nên kết quả cũng là biến ngẫu nhiên, và câu hỏi đặt ra là: biết độ phân tán của từng thành phần, tính được độ phân tán của kết quả không? **Lan truyền sai số (error propagation)** trả lời bằng một công cụ duy nhất: xấp xỉ tuyến tính.

## Xấp xỉ tuyến tính: trái tim của lan truyền sai số

Ý tưởng nền tảng: với độ phân tán nhỏ so với độ cong của hàm, mọi hàm trơn đều gần như đường thẳng quanh điểm làm việc — và với đường thẳng, phương sai lan truyền theo một quy tắc chính xác.

```definition[Lan truyền sai số bậc một, một biến]
Cho $X$ là biến ngẫu nhiên với $E[X] = \mu$, $\operatorname{Var}(X) = \sigma^2$, và $f$ khả vi tại $\mu$. Với $\sigma$ đủ nhỏ so với độ cong của $f$:
$$E[f(X)] \approx f(\mu), \qquad \operatorname{Var}(f(X)) \approx \bigl(f'(\mu)\bigr)^2 \sigma^2.$$
Tức là $\sigma_{f(X)} \approx |f'(\mu)|\, \sigma_X$ — độ dốc của tiếp tuyến đóng vai trò "hệ số khuếch đại" sai số.
```

```proof
Khai triển Taylor bậc một quanh $\mu$:
$$f(X) = f(\mu) + f'(\mu)(X - \mu) + R,$$
với phần dư $R$ bậc $(X-\mu)^2$ — bỏ qua nó vì $\sigma$ nhỏ. Lấy kỳ vọng hai vế: $E[f(X)] \approx f(\mu) + f'(\mu)\,E[X - \mu] = f(\mu)$, vì $E[X - \mu] = 0$. Lấy phương sai: $X - \mu$ có phương sai $\sigma^2$, nhân với hằng số $f'(\mu)$ thì phương sai nhân với bình phương hằng số:
$$\operatorname{Var}(f(X)) \approx \bigl(f'(\mu)\bigr)^2 \operatorname{Var}(X - \mu) = \bigl(f'(\mu)\bigr)^2 \sigma^2. \qedhere$$
```

Hai hệ quả đáng nhớ: (1) **kỳ vọng không đổi** — xấp xỉ bậc một giữ nguyên giá trị trung bình, chỉ lan truyền độ phân tán; (2) **hệ số khuếch đại là trị tuyệt đối của đạo hàm** — nơi hàm dốc, sai số bị phóng to; nơi hàm thoải, sai số bị nén lại.

<figure style="margin:1.8em 0;"><img src="/img/stats/taylor.svg" alt="Xấp xỉ tuyến tính bằng tiếp tuyến" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Hàm y = 1/x (teal) và tiếp tuyến tại x = 2 (vàng). Với σₓ = 0,2, khoảng dọc trên tiếp tuyến là |f′(2)|·σₓ = 0,25 × 0,2 = 0,05 — xấp xỉ rất tốt. Với σₓ = 0,6, tiếp tuyến đã lệch khỏi đường cong: sai số bậc một bỏ đi cỡ |f″(μ)|·σₓ²/2, tăng theo bình phương σₓ.</figcaption></figure>

### Nhiều biến: đạo hàm riêng và hiệp phương sai

Kết quả thực tế hiếm khi là hàm của một phép đo. Với nhiều biến, mỗi biến đóng góp một số hạng riêng, và các biến **tương quan** đóng góp thêm số hạng chéo.

```theorem[Lan truyền sai số nhiều biến]
Cho $Y = f(X_1, \dots, X_k)$ với các biến ngẫu nhiên có kỳ vọng $\mu_i$ và phương sai $\sigma_i^2$. Xấp xỉ bậc một:
$$\sigma_Y^2 \approx \sum_{i=1}^{k} \left(\frac{\partial f}{\partial x_i}\right)^2 \sigma_i^2 \;+\; 2\sum_{i<j} \frac{\partial f}{\partial x_i}\frac{\partial f}{\partial x_j}\,\operatorname{Cov}(X_i, X_j),$$
mọi đạo hàm riêng lấy tại $(\mu_1, \dots, \mu_k)$. Khi các biến **độc lập** (hiệp phương sai bằng 0), chỉ còn tổng các số hạng đầu:
$$\sigma_Y^2 \approx \sum_i \left(\frac{\partial f}{\partial x_i}\right)^2 \sigma_i^2.$$
```

```proof
Khai triển Taylor bậc một nhiều biến quanh $(\mu_1, \dots, \mu_k)$:
$$Y \approx f(\mu_1,\dots,\mu_k) + \sum_i \frac{\partial f}{\partial x_i}(X_i - \mu_i).$$
Phương sai của tổng các số hạng là tổng phương sai cộng tổng hiệp phương sai chéo:
$$\operatorname{Var}(Y) = \sum_i a_i^2 \sigma_i^2 + 2\sum_{i<j} a_i a_j \operatorname{Cov}(X_i, X_j), \qquad a_i = \frac{\partial f}{\partial x_i},$$
đúng theo tính chất $\operatorname{Var}(aX + bZ) = a^2\sigma_X^2 + b^2\sigma_Z^2 + 2ab\,\operatorname{Cov}(X,Z)$. Độc lập làm các số hạng chéo biến mất. $\qedhere$
```

Định lý này là toàn bộ công cụ; mọi quy tắc "cộng phương sai", "cộng phương sai tương đối" chỉ là hệ quả của nó cho những dạng hàm cụ thể. Một công thức gọn để nhớ — với phép cộng/trừ, **phương sai cộng**; với phép nhân/chia, **bình phương hệ số biến thiên cộng**:

```definition[Hệ số biến thiên]
**Hệ số biến thiên (coefficient of variation, CV)** của một đại lượng là độ lệch chuẩn tương đối: $\mathrm{CV} = \sigma/\mu$ (thường viết thành phần trăm). Nó là cách tự nhiên để nói "sai số 0,2% của nồng độ chuẩn" thay vì "sai số 0,0002 M".
```

```remark[Ba quy tắc vàng của lan truyền bậc một]
Với $Y = X_1 \pm X_2$ (độc lập): $\sigma_Y^2 = \sigma_1^2 + \sigma_2^2$.
Với $Y = X_1 \cdot X_2$ hoặc $Y = X_1 / X_2$ (độc lập): $\mathrm{CV}_Y^2 = \mathrm{CV}_1^2 + \mathrm{CV}_2^2$.
Với $Y = c \cdot X$ (hằng số $c$): $\sigma_Y = |c|\,\sigma_X$ — nhân hằng số không làm đổi CV.
```
Chứng minh trực tiếp từ định lý: với phép trừ, đạo hàm riêng của $x_1 - x_2$ là $1$ và $-1$, bình phương lên đều thành $+$; với phép nhân, $\partial(x_1x_2)/\partial x_1 = x_2$, nên $(\sigma_Y/\mu_Y)^2 = (x_2\sigma_1)^2/(x_1x_2)^2 + (x_1\sigma_2)^2/(x_1x_2)^2 = \mathrm{CV}_1^2 + \mathrm{CV}_2^2$; phép chia tương tự. Đây là nguồn gốc của câu nói quen thuộc trong phòng thí nghiệm: "sai số tương đối cộng bình phương lại với nhau".

## Ví dụ 1 — Chuẩn độ: ba nguồn sai số cộng lại

```example[Chuẩn độ NaOH bằng HCl chuẩn]
Xác định nồng độ NaOH bằng cách chuẩn độ $V_2 = 24{,}87$ mL NaOH bằng $V_1 = 25{,}00$ mL HCl chuẩn nồng độ $C_1 = 0{,}1000$ M. Kết quả:
$$C_2 = \frac{C_1 V_1}{V_2} = \frac{0{,}1000 \times 25{,}00}{24{,}87} = 0{,}10052\ \text{M}.$$
Ước lượng độ lệch chuẩn từng thành phần: nồng độ HCl chuẩn $\sigma_{C_1} = 0{,}0002$ M (CV 0,2%); pipette 25 mL $\sigma_{V_1} = 0{,}02$ mL (CV 0,08%); burette đọc hai lần (đầu và cuối), mỗi lần đọc $\sigma = 0{,}01$ mL nên $\sigma_{V_2} = \sqrt{0{,}01^2 + 0{,}01^2} = 0{,}0141$ mL (CV 0,057%). Đây là phép nhân/chia nên CV bình phương cộng:
$$\mathrm{CV}^2 = \left(\frac{0{,}0002}{0{,}1000}\right)^2 + \left(\frac{0{,}02}{25{,}00}\right)^2 + \left(\frac{0{,}0141}{24{,}87}\right)^2 = 4{,}0\times10^{-6} + 0{,}64\times10^{-6} + 0{,}32\times10^{-6} = 4{,}96\times10^{-6},$$
$$\mathrm{CV} = 0{,}00223, \qquad \sigma_{C_2} = 0{,}00223 \times 0{,}10052 = 0{,}00022\ \text{M}.$$
Khoảng 95% (xấp xỉ chuẩn): $C_2 = 0{,}10052 \pm 0{,}00045$ M. Đọc kết quả: 80% bình phương sai số đến từ nồng độ chất chuẩn ($4{,}0/4{,}96$), pipette 13%, burette 6% — muốn cải thiện, phải hiệu chuẩn lại HCl chuẩn trước, chứ không phải đọc burette cẩn thận hơn.
```

```remark[Kiểm chứng bằng Monte Carlo]
Không cần tin công thức — mô phỏng trực tiếp: sinh 20 000 lần bộ ba $(C_1, V_1, V_2)$ từ phân phối chuẩn với đúng các $\sigma$ trên, tính $C_2$ mỗi lần. Kết quả (Hình 2): trung bình $0{,}10052$ M, độ lệch chuẩn $0{,}000222$ M — khớp công thức bậc một ($0{,}000224$) trong phạm vi sai số mô phỏng, và 95,5% giá trị nằm trong $\pm 2\sigma$. Công thức lan truyền là chính xác đến mức có thể kiểm chứng bằng số.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/montecarlo.svg" alt="Monte Carlo xác nhận công thức lan truyền" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Histogram của 20 000 mô phỏng chuẩn độ (xám) và đường cong chuẩn N(0,10052; 0,000224²) dự đoán bởi công thức bậc một (teal). Hai cái gần như trùng khít: xấp xỉ tuyến tính là đủ chính xác khi mọi CV dưới 1%.</figcaption></figure>

## Ví dụ 2 — pH: sai số logarit chỉ phụ thuộc CV

```example[Sai số của pH từ hoạt độ ion]
pH được định nghĩa $\mathrm{pH} = -\log_{10}[H^+]$. Đạo hàm:
$$\left|\frac{d}{d[H^+]}\bigl(-\log_{10}[H^+]\bigr)\right| = \frac{1}{[H^+]\ln 10}.$$
Theo bổ đề một biến:
$$\sigma_{\mathrm{pH}} \approx \frac{\sigma_{[H^+]}}{[H^+]\ln 10} = \frac{\mathrm{CV}_{[H^+]}}{\ln 10} \approx 0{,}434\,\mathrm{CV}_{[H^+]}.$$
Với nồng độ đo được $\mathrm{CV} = 5\%$: $\sigma_{\mathrm{pH}} = 0{,}05/\ln 10 = 0{,}022$ đơn vị pH.
```
Kết quả đáng chú ý: **sai số pH không phụ thuộc giá trị tuyệt đối của nồng độ** — đo $10^{-3}$ hay $10^{-7}$ M với cùng CV 5% đều cho cùng $\sigma_{\mathrm{pH}} \approx 0{,}02$. Đó là vì logarit "nén" thang đo: khoảng cách tương đối trở thành khoảng cách tuyệt đối. Hệ quả ngược lại cũng đúng: một sai số tuyệt đối cố định trong pH (ví dụ $\pm 0{,}05$) tương ứng với CV của nồng độ khoảng $0{,}05 \times \ln 10 = 11{,}5\%$ — một sự không chắc chắn rất lớn của nồng độ, điều người làm sinh học hay quên khi báo cáo "pH = 7,40 ± 0,05".

## Ví dụ 3 — Pha loãng nối tiếp: sai số tích luỹ qua từng bước

```example[Pha loãng 1:100 hai bước]
Pha loãng nối tiếp hai lần, mỗi bước hút 1,00 mL (pipette, $\sigma = 0{,}008$ mL, CV 0,8%) vào bình định mức 100 mL ($\sigma = 0{,}08$ mL, CV 0,08%). Nồng độ cuối $C = C_0 \cdot (V_p/V_f)^2$, nên CV bình phương cộng qua hai bước:
$$\mathrm{CV}_C^2 = 2\bigl(\mathrm{CV}_p^2 + \mathrm{CV}_f^2\bigr) = 2\bigl(0{,}008^2 + 0{,}0008^2\bigr) = 1{,}29\times10^{-4}, \qquad \mathrm{CV}_C = 1{,}14\%.$$
So sánh thành phần: pipette đóng góp $2 \times 0{,}008^2 = 1{,}28\times10^{-4}$, bình định mức chỉ $1{,}3\times10^{-6}$ — **pipette chiếm 99% sai số**. Bài học thiết kế: sau hai bước, sai số tương đối ~1,1% dù mỗi bước nhìn rất "chính xác"; muốn giảm, phải cải thiện độ chính xác của pipette (hoặc dùng bình định mức lớn hơn, pha ít bước hơn). Nếu pha ba bước, CV tăng lên $\sqrt{3/2} \approx 1{,}22$ lần — sai số tích luỹ theo căn số bước.
```

## Ví dụ 4 — Trừ blank: khi sai số tương quan lại là bạn

Công thức đầy đủ có số hạng hiệp phương sai mà nhiều người bỏ qua — nhưng đôi khi chính nó làm việc có lợi cho ta.

```example[Đo hấp thụ trừ blank trên cùng một máy]
Định lượng bằng quang phổ: độ hấp thụ thực $A_{\text{net}} = A_{\text{sample}} - A_{\text{blank}}$, với $A_{\text{sample}} = 0{,}450$, $A_{\text{blank}} = 0{,}020$. Giả sử mỗi phép đo gồm nhiễu riêng $\sigma_\varepsilon = 0{,}003$ và "trôi máy" chung $\sigma_\delta = 0{,}004$ (cường độ đèn, nhiệt độ cuvet thay đổi giữa các lần chạy). Từng phép đo đơn lẻ có $\sigma = \sqrt{0{,}003^2 + 0{,}004^2} = 0{,}005$.
$$A_{\text{net}} = A_{\text{sample}} - A_{\text{blank}} = 0{,}450 - 0{,}020 = 0{,}430.$$
Nếu coi hai phép đo độc lập (công thức bậc một bỏ hiệp phương sai): $\sigma_{\text{net}} = \sqrt{0{,}005^2 + 0{,}005^2} = 0{,}0071$, tức $\mathrm{CV} = 1{,}64\%$.
Nhưng sample và blank được đo liền nhau trên cùng máy, nên trôi chung $\delta$ xuất hiện ở cả hai với dấu như nhau và **triệt tiêu trong hiệu**: $\operatorname{Cov}(A_s, A_b) = \sigma_\delta^2$, và
$$\sigma_{\text{net}}^2 = \sigma_s^2 + \sigma_b^2 - 2\operatorname{Cov}(A_s, A_b) = 2(0{,}003^2 + 0{,}004^2) - 2(0{,}004^2) = 2(0{,}003^2),$$
$$\sigma_{\text{net}} = \sqrt{2}\times 0{,}003 = 0{,}0042, \qquad \mathrm{CV} = 0{,}99\%.$$
```

<figure style="margin:1.8em 0;"><img src="/img/stats/correlated.svg" alt="Sai số tương quan triệt tiêu trong hiệu số" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Hai giả định về A_net = A_sample − A_blank với cùng độ phân tán 0,005 của từng phép đo: (a) coi hai phép đo độc lập, σ = 0,0071 (CV 1,64%); (b) tính đúng hiệp phương sai do trôi chung, σ = 0,0042 (CV 0,99%) — phân bố hẹp hơn 1,7 lần. Đo blank ngay trước sample biến sai số chung thành lợi thế.</figcaption></figure>

Bài học tổng quát: **công thức bậc một không có hiệp phương sai là giới hạn trên khi các sai số tương quan dương** — dùng nó mà không xét tương quan thì ước lượng sai số thường bi quan hơn thực tế (trong trừ blank, trong hiệu khối lượng cân cùng cân phân tích). Ngược lại, nếu hai phép đo dùng chung một nguồn sai số theo hướng ngược nhau, tương quan có thể làm sai số tệ hơn — luôn xét xem các phép đo có dùng chung dụng cụ, chung mẫu chuẩn, chung thời điểm hay không.

## Ví dụ 5 — Suy ngược từ đường chuẩn hồi quy

Phần 1 dùng đường chuẩn HPLC $y = 120 + 2150x$ để suy nồng độ mẫu $x_0 = 4{,}02$ µM từ diện tích peak $y_0 = 8760$. Câu hỏi lan truyền: **đường chuẩn tự nó có sai số** — hệ số $a$, $b$ là ước lượng từ dữ liệu — nên $x_0$ suy ngược cũng có sai số. Công thức chuẩn cho sai số của dự đoán ngược (một mẫu, đo $m$ lần):

```definition[Khoảng tin cậy của dự đoán ngược]
Với đường hồi quy $\hat{y} = a + bx$ từ $n$ điểm chuẩn, sai số chuẩn của nồng độ suy ngược $x_0 = (y_0 - a)/b$ là
$$s_{x_0} = \frac{s_{yx}}{b}\sqrt{\frac{1}{m} + \frac{1}{n} + \frac{(y_0 - \bar{y})^2}{b^2\sum_i (x_i - \bar{x})^2}}, \qquad s_{yx} = \sqrt{\frac{\sum_i (y_i - \hat{y}_i)^2}{n - 2}},$$
và khoảng 95% là $x_0 \pm t_{n-2,\,0{,}975}\, s_{x_0}$.
```

```example[Sai số của nồng độ HPLC suy ngược]
Dữ liệu dãy chuẩn từ Phần 1: $n = 5$ điểm, $\bar{y} = 32384$, $b = 2151{,}7$, $\sum(x_i - \bar{x})^2 = 1000$, $s_{yx} = 37{,}6$. Với $y_0 = 8760$ (đo $m = 1$ lần):
$$s_{x_0} = \frac{37{,}6}{2151{,}7}\sqrt{1 + \frac{1}{5} + \frac{(8760 - 32384)^2}{2151{,}7^2 \times 1000}} = 0{,}0175 \times \sqrt{1{,}32} = 0{,}0201\ \text{µM}.$$
Với $t_{3,\,0{,}975} = 3{,}182$ (chỉ 3 bậc tự do!):
$$x_0 = 4{,}02 \pm 3{,}182 \times 0{,}020 = 4{,}02 \pm 0{,}064\ \text{µM}.$$
```
Hai chi tiết đáng chú ý. Thứ nhất, $t_{3} = 3{,}182$ lớn vì chỉ có 5 điểm chuẩn — khoảng tin cậy rộng gấp $\approx 1{,}6$ lần so với dùng hằng số 2. Thứ hai, số hạng $(y_0 - \bar{y})^2$ nói rằng **dự đoán càng xa tâm của dãy chuẩn càng kém chắc chắn** — suy ngược ở giữa dãy chuẩn (gần $\bar{y}$) là an toàn nhất, ngoại suy ra ngoài dải chuẩn là phạm vào vùng không có dữ liệu kiểm chứng.

## Khi nào công thức bậc một đủ chính xác?

Công thức bậc một bỏ phần dư bậc hai, nên sai số của chính nó cỡ $|f''(\mu)|\sigma^2/2$ — **tỉ lệ với bình phương** $\sigma$. Kiểm tra định lượng bằng một hàm phi tuyến điển hình:

```remark[Số hạng bậc hai: ví dụ Y = X²]
Với $X \sim \mathcal{N}(\mu, \sigma^2)$ và $Y = X^2$: bậc một cho $\operatorname{Var}(Y) \approx 4\mu^2\sigma^2$, trong khi giá trị chính xác là $\operatorname{Var}(Y) = 4\mu^2\sigma^2 + 2\sigma^4$ (tính từ moment bậc bốn của phân phối chuẩn). Với $\sigma/\mu = 0{,}1$, số hạng $2\sigma^4$ chỉ thêm 0,5% — bậc một thừa sức. Với $\sigma/\mu = 0{,}5$ (dữ liệu rất phân tán), nó thêm tới 12,5% và bậc một bắt đầu sai đáng kể.
```
Quy tắc thực hành: nếu mọi CV thành phần dưới ~10% và hàm không quá cong (không gần điểm cực trị nơi $f' = 0$), công thức bậc một chính xác đến vài phần trăm. Khi nghi ngờ — hàm cực cong, CV lớn, hoặc cần con số chính xác để báo cáo — **chạy Monte Carlo**: mô phỏng hàng chục nghìn lần, đo độ phân tán của kết quả trực tiếp, không cần công thức. Đó là cách kiểm tra chéo luôn sẵn có và là chuẩn mực trong GUM [^3].

## Cạm bẫy thực hành

1. **Quên hiệp phương sai.** Công thức rút gọn chỉ đúng khi các phép đo độc lập. Hai phép đo trên cùng dụng cụ, cùng mẫu chuẩn, cùng một lần hiệu chuẩn thì không độc lập — và như Ví dụ 4 cho thấy, tính đúng tương quan có thể thay đổi kết luận tới 1,7 lần.
2. **Nhầm độ phân tán của dụng cụ với độ phân tán của phép đo.** $\sigma$ trong công thức là độ phân tán của *cả quy trình đo* — bao gồm lấy mẫu, xử lý mẫu, không chỉ số đọc của máy. Ước lượng nó bằng độ lệch chuẩn của các lần lặp độc lập thực sự (Phần 1), không phải dung sai ghi trên thiết bị.
3. **Làm tròn quá sớm.** $C_2 = 0{,}10052$ M với $\sigma = 0{,}00022$ M: báo cáo $0{,}1005 \pm 0{,}0002$ M (giữ 1–2 chữ số có nghĩa cho sai số). Làm tròn $C_2$ thành $0{,}10$ M trước khi tính tiếp sẽ nuốt mất thông tin; chỉ làm tròn ở bước báo cáo cuối cùng.
4. **Sai số hệ thống không nằm trong công thức.** Lan truyền sai số chỉ xử lý sai số ngẫu nhiên. Một chất chuẩn bị pha sai, một pipette bị lệch hiệu chuẩn, một máy đo bị trôi có hệ thống — tất cả đều tạo sai lệch (bias) mà công thức không thấy. Kiểm soát bằng chất chuẩn độc lập, mẫu kiểm soát, và hiệu chuẩn định kỳ.
5. **Báo cáo "±" không rõ nghĩa.** "± 0,0002" là một $\sigma$, khoảng 95%, hay dung sai? GUM khuyến nghị nêu rõ: "0,10052 ± 0,00022 (1 SD, từ lan truyền sai số của 3 thành phần)". Người đọc cần biết con số đó là gì để dùng đúng.

## Lộ trình tiếp theo

Bài này đã trả lời câu hỏi "sai số của kết quả tính từ đâu" bằng một công cụ duy nhất — xấp xỉ tuyến tính. Để đào sâu: (1) đọc Ku 1966 [^1], bài kinh điển ngắn về lan truyền sai số với đầy đủ ví dụ hoá phân tích; (2) giáo trình Taylor [^2] cho phần chứng minh và trực giác; (3) GUM [^3] cho chuẩn mực quốc tế về báo cáo độ không chắc chắn, gồm cả phương pháp Monte Carlo; (4) chương sai số của Harris [^4] cho bối cảnh hoá phân tích cụ thể (pipette, burette, cân phân tích); (5) e-Handbook của NIST [^5] cho công thức và bài tập. Bước tiếp theo tự nhiên của loạt bài: hồi quy dưới ánh sáng mô hình $X = \mu + \varepsilon$ — mỗi hệ số hồi quy là một ước lượng có phân phối mẫu riêng, và chính khung "phân phối mẫu + trục xoay" của Phần 3 mở ra các kiểm định về độ dốc và tung độ gốc.

[^1]: H. H. Ku, "Notes on the use of propagation of error formulas," *Journal of Research of the National Bureau of Standards* 70C(4): 263–273, 1966.
[^2]: J. R. Taylor, *An Introduction to Error Analysis: The Study of Uncertainties in Physical Measurements*, 2nd ed., University Science Books, 1997.
[^3]: JCGM 100:2008, *Evaluation of measurement data — Guide to the expression of uncertainty in measurement (GUM)*, Joint Committee for Guides in Metrology, BIPM, 2008.
[^4]: D. C. Harris, *Quantitative Chemical Analysis*, 9th ed., W. H. Freeman, 2016 — chương về sai số, thống kê và kiểm soát chất lượng.
[^5]: NIST/SEMATECH *e-Handbook of Statistical Methods*, mục "Propagation of error" — https://www.itl.nist.gov/div898/handbook/.
