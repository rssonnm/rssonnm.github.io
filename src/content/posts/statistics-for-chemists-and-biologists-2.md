---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 2: Biến ngẫu nhiên và phân phối"
date: 2026-08-10T10:00:00
description: "Phần 1 đã tính trung bình, phương sai, độ lệch chuẩn từ dữ liệu. Phần 2 trả lời câu hỏi: những con số đó ước lượng cái gì trong thế giới? Bài viết xây dựng nền tảng xác suất — biến ngẫu nhiên, phân phối (PMF, PDF, CDF), kỳ vọng, phương sai, định lý số lớn — và kết nối chúng với các phân phối thường gặp trong hoá học, sinh học: nhị thức, Poisson, log-normal."
topic: mathematics
tags: [statistics, probability, random-variables, distributions, expectation, tutorial]
featured: false
draft: false
---

Bài trước ([Phần 1 — Thống kê cơ bản](/blog/statistics-for-chemists-and-biologists/)) dạy cách tính từ dữ liệu: trung bình mẫu $\bar{x}$, phương sai mẫu $s^2$, độ lệch chuẩn $s$. Nhưng có một câu hỏi mà Phần 1 cố tình chưa trả lời: những con số đó **ước lượng cái gì**? $\bar{x}$ là trung bình của mẫu — vậy "trung bình của quần thể" nghĩa là gì, khi quần thể là vô hạn và không bao giờ đo hết được?

Câu trả lời nằm ở chỗ coi dữ liệu không phải là "những con số", mà là **kết quả quan sát được của một quá trình ngẫu nhiên**. Mỗi phép đo là một lần rút ra từ một phân phối. Khi đó:

- **Trung bình quần thể** trở thành một khái niệm chính xác: *kỳ vọng* $E[X]$ — giá trị trung bình mà bạn sẽ thu được nếu rút mẫu mãi mãi.
- **Phương sai quần thể** trở thành *phương sai của phân phối* $\operatorname{Var}(X)$ — độ phân tán vốn có của quá trình sinh ra dữ liệu.

Phần 2 xây nền tảng đó theo đúng hai mục tiêu: hiểu dữ liệu là biến ngẫu nhiên (xác suất, biến ngẫu nhiên, phân phối), rồi hiểu biến thiên ở mức lý thuyết (kỳ vọng, phương sai, độ lệch chuẩn của phân phối). Như Phần 1: mọi công thức được diễn giải từng thành phần, có chứng minh và ví dụ hoá học, sinh học cụ thể.

## Phần A — Xác suất và biến ngẫu nhiên

### Xác suất: tần suất dài hạn và ba tiên đề

Khi nói "xác suất một giếng nuôi cấy mọc là 0,8", ta muốn nói gì? Diễn giải tự nhiên nhất cho nhà thực nghiệm là **tần suất dài hạn**: nếu lặp lại thí nghiệm vô hạn lần, tỉ lệ giếng mọc sẽ hội tụ về 0,8. Với một số lần lặp hữu hạn, ta chỉ ước lượng được con số đó — nhưng khái niệm xác suất là giới hạn lý tưởng, không phụ thuộc vào việc bạn đã làm bao nhiêu lần.

```definition[Xác suất theo tần suất]
**Xác suất** của biến cố $A$, ký hiệu $P(A)$, là giới hạn của tần suất tương đối của $A$ khi số lần lặp thí nghiệm tiến ra vô hạn:
$$P(A) = \lim_{n\to\infty} \frac{\text{số lần } A \text{ xảy ra trong } n \text{ lần}}{n}.$$
```

Từ định nghĩa này suy ra ba tính chất, được Kolmogorov nâng thành tiên đề năm 1933 [^7]:

```remark[Ba tiên đề xác suất]
(1) **Chặn.** $0 \le P(A) \le 1$ với mọi biến cố. Giá trị 0 nghĩa là biến cố không bao giờ xảy ra; giá trị 1 nghĩa là biến cố chắc chắn xảy ra; mọi giá trị ở giữa là "thỉnh thoảng". Hệ quả thực hành: một phép tính cho xác suất âm hoặc lớn hơn 1 chắc chắn sai ở đâu đó.

(2) **Toàn bộ.** $P(\Omega) = 1$, với $\Omega$ là tập mọi kết quả có thể của thí nghiệm. Một trong các khả năng chắc chắn xảy ra, nên tổng xác suất của mọi kết quả bằng 1. Chẳng hạn: nếu $P(\text{giếng mọc}) = 0{,}8$ thì $P(\text{giếng không mọc}) = 0{,}2$, vì hai khả năng này phủ kín toàn bộ $\Omega$.

(3) **Cộng tính.** Nếu $A$ và $B$ không thể xảy ra đồng thời, thì $P(A \cup B) = P(A) + P(B)$: xác suất của "hoặc $A$, hoặc $B$" bằng tổng hai xác suất. Điều kiện loại trừ là bắt buộc — nếu $A$ và $B$ giao nhau, cộng thẳng sẽ đếm trùng phần chung.
```

Tính chất (3) là công cụ làm việc hàng ngày: nếu các khả năng rời nhau phủ hết mọi kết quả, xác suất của chúng cộng lại bằng 1. Ví dụ, với một con xúc xắc cân đối, $P(\text{ra 1}) + \cdots + P(\text{ra 6}) = 1$, và vì đối xứng nên mỗi mặt có xác suất $1/6$.

Một điểm cần phân biệt rõ ngay từ đầu: xác suất gán cho **biến cố** (sự kiện quan sát được), không gán cho **giả thuyết khoa học**. "Xác suất giếng mọc là 0,8" là một câu hợp lệ; "xác suất giả thuyết của tôi đúng là 0,95" thì không — giả thuyết đúng hoặc sai, không phải biến cố ngẫu nhiên theo nghĩa tần suất. Sự nhầm lẫn này là gốc của nhiều cách hiểu sai p-value mà Phần 1 đã cảnh báo.

### Biến ngẫu nhiên: từ kết quả đến con số

```definition[Biến ngẫu nhiên]
**Biến ngẫu nhiên (random variable)** là một quy tắc gán một con số cho mỗi kết quả có thể của thí nghiệm. Biến ngẫu nhiên **rời rạc (discrete)** nhận giá trị trong một tập đếm được (0, 1, 2, …); biến ngẫu nhiên **liên tục (continuous)** nhận giá trị trên một khoảng số thực.
```

Điểm mấu chốt: biến ngẫu nhiên là *quy tắc* — cái mô tả sự không chắc chắn của thí nghiệm trước khi làm. Dữ liệu bạn thu được là các **giá trị thực hoá (realization)** của biến ngẫu nhiên: lặp thí nghiệm, nhận giá trị khác, nhưng quy tắc thì không đổi.

```example[Biến ngẫu nhiên trong phòng thí nghiệm]
- $X$ = số khuẩn lạc trên một đĩa thạch sau khi trải 0,1 mL dịch pha loãng. Rời rạc: $X \in \{0, 1, 2, \dots\}$.
- $Y$ = giá trị IC50 đo được của một hợp chất. Liên tục: $Y$ nằm trong một khoảng thực, và đo lại sẽ cho giá trị hơi khác.
- $Z$ = kết quả kiểm tra một mẫu (dương/âm). Rời rạc, chỉ hai giá trị — đây là biến Bernoulli.
```

Vì sao coi một phép đo là biến ngẫu nhiên? Vì phép đo có sai số: dụng cụ nhiễu, thao tác khác nhau, mẫu không đồng nhất. Nếu đo cùng một dung dịch sáu lần và được sáu con số khác nhau, sáu con số đó là sáu thực hoá độc lập của cùng một biến ngẫu nhiên. Toàn bộ thống kê suy luận đứng trên nhận định này: dữ liệu là cửa sổ nhìn vào phân phối đằng sau nó.

### Phân phối: PMF, PDF, CDF

Phân phối của một biến ngẫu nhiên là "bản đồ đầy đủ" của sự không chắc chắn: nó cho biết mỗi giá trị (hoặc mỗi khoảng giá trị) có xác suất bao nhiêu. Ba cách mô tả, tuỳ loại biến:

```definition[Hàm khối xác suất (PMF)]
Với biến ngẫu nhiên rời rạc $X$, **hàm khối xác suất (probability mass function, PMF)** là
$$p(k) = P(X = k),$$
và $\sum_k p(k) = 1$ — các khối xác suất cộng lại bằng 1 theo tiên đề (3).
```

```definition[Hàm mật độ xác suất (PDF)]
Với biến ngẫu nhiên liên tục $X$ có **hàm mật độ xác suất (probability density function, PDF)** $f$, xác suất $X$ rơi vào khoảng $[a, b]$ là diện tích dưới đường $f$:
$$P(a \le X \le b) = \int_a^b f(x)\,dx,$$
với $f(x) \ge 0$ và $\int_{-\infty}^{\infty} f(x)\,dx = 1$.
```

```remark[$f(x)$ không phải xác suất]
Với biến liên tục, $P(X = x) = 0$ cho từng giá trị riêng lẻ — diện tích của một đường thẳng đứng là 0. Nói khác đi: một phép đo liên tục không bao giờ lặp lại chính xác một giá trị. Vì vậy $f(x)$ là **mật độ**, không phải xác suất: nó có thể lớn hơn 1 (miễn là diện tích tổng bằng 1). Ví dụ chuẩn tắc $\mathcal{N}(\mu, \sigma^2)$ với $\sigma = 0{,}3$ có $f(\mu) = 1/(0{,}3\sqrt{2\pi}) \approx 1{,}33 > 1$ — hoàn toàn hợp lệ, vì xác suất nằm ở diện tích, không nằm ở chiều cao.
```

```definition[Hàm phân phối tích luỹ (CDF)]
**Hàm phân phối tích luỹ (cumulative distribution function, CDF)** của $X$ là
$$F(x) = P(X \le x).$$
$F$ đơn điệu không giảm, tiến về 0 khi $x \to -\infty$ và về 1 khi $x \to +\infty$, và với mọi $a < b$:
$$P(a < X \le b) = F(b) - F(a).$$
```

CDF là mô tả **phổ quát**: nó hoạt động cho cả biến rời rạc lẫn liên tục, và đó là lý do mọi phần mềm thống kê đều dùng nó để tính xác suất đuôi (chính là thứ sinh ra p-value ở Phần 1).

<figure style="margin:1.8em 0;"><img src="/img/stats/pmf-cdf.svg" alt="PMF và CDF của phân phối nhị thức" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Phân phối nhị thức n = 10, p = 0,3: bên trái là PMF (các khối xác suất cộng bằng 1), bên phải là CDF (tích luỹ dần các khối — mỗi bậc thang cao thêm đúng một khối của PMF).</figcaption></figure>

<figure style="margin:1.8em 0;"><img src="/img/stats/pdf-cdf.svg" alt="Mật độ và CDF của chuẩn tắc" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — Chuẩn tắc: xác suất là diện tích dưới mật độ (trái, vùng −1 đến 1 = 68%); CDF (phải) là diện tích tích luỹ từ −∞ đến x, và F(1) − F(−1) = 0,84 − 0,16 = 0,68 — đúng bằng diện tích ở panel trái.</figcaption></figure>

```example[CDF của một con xúc xắc]
Với $X$ là mặt xuất hiện của xúc xắc cân đối: $p(1) = \cdots = p(6) = 1/6$. CDF: $F(1) = 1/6 \approx 0{,}167$; $F(2) = 2/6$; …; $F(6) = 1$. Xác suất ra mặt từ 2 đến 4: $F(4) - F(1) = 4/6 - 1/6 = 1/2$. Chú ý $F$ nhảy tại từng giá trị rời rạc — dạng bậc thang như Hình 1 (bên phải).
```

## Phần B — Kỳ vọng, phương sai, độ lệch chuẩn của phân phối

Giờ ta quay lại ba đại lượng của mục tiêu đầu tiên, nhưng ở mức lý thuyết: không còn là "tính từ mẫu", mà là *đặc tính của phân phối* — thứ mà các công thức mẫu ở Phần 1 đang ước lượng.

### Kỳ vọng $E[X]$

```definition[Kỳ vọng]
**Kỳ vọng (expectation)** của biến ngẫu nhiên $X$ là
$$E[X] = \sum_k k\,p(k) \quad \text{(rời rạc)}, \qquad E[X] = \int_{-\infty}^{\infty} x\,f(x)\,dx \quad \text{(liên tục)}.$$
```

Đọc công thức: mỗi giá trị $k$ được cân theo xác suất $p(k)$ của nó. Giá trị nào càng có khả năng xảy ra, càng kéo kỳ vọng về phía mình — đây chính là **tâm khối lượng** của phân phối, giống hệt trung bình mẫu là điểm cân bằng của dữ liệu ở Phần 1.

<figure style="margin:1.8em 0;"><img src="/img/stats/expectation.svg" alt="Kỳ vọng là điểm cân bằng" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Kỳ vọng là điểm cân bằng của khối xác suất: các khối lượng xác suất (bán kính tỉ lệ với p(k)) đặt tại 1, 2, 3, 4, 5; thanh cân bằng tại E[X] = 3,65 — lệch về phía giá trị có xác suất cao hơn.</figcaption></figure>

```example[Kỳ vọng của một con xúc xắc]
$E[X] = 1\cdot\frac{1}{6} + 2\cdot\frac{1}{6} + \cdots + 6\cdot\frac{1}{6} = \frac{21}{6} = 3{,}5.$ Đáng chú ý: 3,5 không phải một giá trị có thể xuất hiện — kỳ vọng không cần là giá trị "có thật", nó là trung bình dài hạn. Gieo 1000 lần, tổng chia 1000 sẽ nằm rất gần 3,5, dù chưa từng có lần gieo nào "ra 3,5".
```

Kỳ vọng có hai tính chất tuyến tính quan trọng, đúng với mọi biến ngẫu nhiên (không cần độc lập):

```lemma[Tính tuyến tính của kỳ vọng]
Với mọi hằng số $a, b$ và mọi biến ngẫu nhiên $X, Y$:
$$E[aX + b] = aE[X] + b, \qquad E[X + Y] = E[X] + E[Y].$$
```

Tính chất thứ hai thường gây bất ngờ vì *không* đòi hỏi $X$ và $Y$ độc lập. Ví dụ trong hoá phân tích: nếu khối lượng mẫu $M$ và nồng độ đo được $C$ là hai biến ngẫu nhiên, thì khối lượng chất phân tích $MC$ có kỳ vọng cần tính cẩn thận (không phải $E[M]E[C]$ nếu chúng tương quan) — nhưng tổng như $M + C$ thì luôn có $E[M+C] = E[M] + E[C]$.

### Định lý số lớn

Vì sao $\bar{x}$ ở Phần 1 lại "đáng tin"? Định lý số lớn, kết quả đầu tiên của lý thuyết xác suất (Bernoulli công bố năm 1713 [^6]), chính là cầu nối từ mẫu đến phân phối:

```theorem[Định lý số lớn (dạng yếu)]
Cho $X_1, X_2, \dots$ độc lập, cùng phân phối với kỳ vọng $\mu = E[X]$. Với mọi $\varepsilon > 0$:
$$P\left(\left|\frac{X_1 + \cdots + X_n}{n} - \mu\right| > \varepsilon\right) \to 0 \quad \text{khi } n \to \infty.$$
```

Nội dung: **trung bình mẫu hội tụ về kỳ vọng khi cỡ mẫu tăng**. Đây không phải sự mặc khải — nó là hệ quả toán học của việc xác suất là tần suất dài hạn. Và nó giải thích vì sao $\bar{x}$ ước lượng $\mu$: mẫu càng lớn, khoảng cách giữa hai thứ càng nhỏ (theo nghĩa xác suất).

<figure style="margin:1.8em 0;"><img src="/img/stats/lln.svg" alt="Định lý số lớn: trung bình cộng dồn hội tụ" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Trung bình cộng dồn của 200 lần gieo xúc xắc: dao động mạnh lúc đầu (vài lần gieo đầu có thể lệch xa 3,5), rồi siết dần về E[X] = 3,5. Sau 200 lần, giá trị ≈ 3,34 — đã gần, và càng gieo càng gần hơn.</figcaption></figure>

```remark[Định lý số lớn nói về trung bình, không nói về cá thể]
Định lý số lớn không hề nói "sau nhiều lần thua, xác suất thắng tăng lên". Xác suất của lần gieo kế tiếp không đổi — sai lầm này có tên riêng: ngụy biện con bạc (gambler's fallacy). Cái hội tụ là *trung bình* của nhiều lần, không phải hành vi của từng lần. Tương tự trong sinh học: nuôi cấy nhiều đĩa làm tỉ lệ mọc ước lượng chính xác hơn, nhưng không làm thay đổi xác suất mọc của từng đĩa.
```

### Phương sai và độ lệch chuẩn

```definition[Phương sai và độ lệch chuẩn của phân phối]
**Phương sai** của $X$ là
$$\operatorname{Var}(X) = E\left[\left(X - E[X]\right)^2\right],$$
và **độ lệch chuẩn** là $\operatorname{SD}(X) = \sqrt{\operatorname{Var}(X)}$.
```

Đọc công thức: lấy mỗi giá trị, trừ đi tâm $\mu = E[X]$ (độ lệch), bình phương (để không triệt tiêu và phạt độ lệch lớn), rồi lấy kỳ vọng — trung bình có trọng số của các bình phương độ lệch. Đây chính là bản sao lý thuyết của phương sai mẫu $s^2$ ở Phần 1: chỉ khác là trung bình theo phân phối thay vì theo dữ liệu.

Công thức khai triển sau đây là công cụ tính nhanh phổ biến nhất:

```lemma[Công thức khai triển phương sai]
$$\operatorname{Var}(X) = E[X^2] - \left(E[X]\right)^2.$$
```

```proof
Đặt $\mu = E[X]$. Khai triển bình phương rồi dùng tính tuyến tính của kỳ vọng:
$$\operatorname{Var}(X) = E[(X-\mu)^2] = E[X^2 - 2\mu X + \mu^2] = E[X^2] - 2\mu E[X] + \mu^2 = E[X^2] - \mu^2.$$
```

Hai tính chất thao tác, đúng với mọi $X$:

```remark[Đổi đơn vị và cộng phương sai]
- $\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X)$ và $\operatorname{SD}(aX + b) = |a|\,\operatorname{SD}(X)$. Dịch chuyển $b$ không đổi độ phân tán; co giãn $a$ làm độ lệch chuẩn co giãn theo $|a|$ — nếu đổi đơn vị từ mg sang µg (nhân 1000), SD cũng nhân 1000, còn phương sai nhân một triệu.
- Nếu $X$ và $Y$ **độc lập**: $\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$. Chú ý: *phương sai* cộng, còn *độ lệch chuẩn thì không* — $\operatorname{SD}(X+Y) = \sqrt{\operatorname{SD}(X)^2 + \operatorname{SD}(Y)^2}$, nhỏ hơn tổng hai SD. Đây là lý do sai số của tổng nhỏ hơn tổng các sai số, và là nền móng của công thức SEM = s/√n ở Phần 1: phương sai của trung bình $n$ quan sát độc lập là $\sigma^2/n$.
```

```example[Tính tay phương sai của xúc xắc]
Với $X$ là mặt xúc xắc: $E[X] = 3{,}5$ và
$$E[X^2] = \frac{1^2 + 2^2 + \cdots + 6^2}{6} = \frac{91}{6} \approx 15{,}17.$$
Theo công thức khai triển:
$$\operatorname{Var}(X) = \frac{91}{6} - \left(\frac{7}{2}\right)^2 = \frac{35}{12} \approx 2{,}92, \qquad \operatorname{SD}(X) = \sqrt{\frac{35}{12}} \approx 1{,}71.$$
```

<figure style="margin:1.8em 0;"><img src="/img/stats/variance.svg" alt="Phương sai: độ lệch so với trung bình" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 5 — Phương sai đo độ dài các độ lệch xᵢ − x̄: nhóm trái bám sát trung bình (s² ≈ 11), nhóm phải phân tán (s² ≈ 390). Các đoạn đứt chính là các độ lệch — bình phương chúng rồi lấy trung bình.</figcaption></figure>

Kết nối với Phần 1: phương sai mẫu $s^2$ là ước lượng không chệch của $\operatorname{Var}(X)$ (hiệu chỉnh Bessel, đã chứng minh ở Phần 1); $s$ ước lượng $\operatorname{SD}(X)$; và $\bar{x}$ ước lượng $E[X]$ theo định lý số lớn. Cả ba con số trong Phần 1 giờ đều có "nguyên mẫu" lý thuyết.

### Ba phân phối quan trọng với hoá học và sinh học

Hai mục tiêu của Phần 2 gặp nhau ở đây: sau khi có khái niệm biến ngẫu nhiên và biết cách tính $E[X]$, $\operatorname{Var}(X)$, ta áp dụng cho ba phân phối xuất hiện khắp nơi trong phòng thí nghiệm.

```definition[Phân phối nhị thức]
Cho $n$ phép thử độc lập, mỗi phép thử thành công với xác suất $p$. Gọi $X$ là số lần thành công. $X$ có **phân phối nhị thức (binomial)**, ký hiệu $X \sim \operatorname{Bin}(n, p)$, với PMF
$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \qquad k = 0, 1, \dots, n.$$
```

Hệ số $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ đếm số cách chọn ra $k$ phép thử thành công trong $n$; $p^k(1-p)^{n-k}$ là xác suất của một cách cụ thể như vậy. Kỳ vọng và phương sai có công thức gọn, và chứng minh minh hoạ đẹp một kỹ thuật quan trọng:

```lemma[Kỳ vọng và phương sai của nhị thức]
Nếu $X \sim \operatorname{Bin}(n, p)$ thì
$$E[X] = np, \qquad \operatorname{Var}(X) = np(1-p).$$
```

```proof
Viết $X = I_1 + I_2 + \cdots + I_n$, trong đó $I_j = 1$ nếu phép thử thứ $j$ thành công, bằng 0 nếu không — mỗi $I_j$ là biến Bernoulli với $E[I_j] = p$ và $\operatorname{Var}(I_j) = p(1-p)$ (kiểm tra: $E[I_j^2] = E[I_j] = p$, nên $\operatorname{Var}(I_j) = p - p^2$). Dùng tính tuyến tính của kỳ vọng (không cần độc lập):
$$E[X] = \sum_j E[I_j] = np.$$
Vì các phép thử độc lập nên các $I_j$ độc lập, và phương sai của tổng là tổng các phương sai:
$$\operatorname{Var}(X) = \sum_j \operatorname{Var}(I_j) = np(1-p).$$
```

Kỹ thuật "viết thành tổng các biến chỉ báo" (indicator variables) này có mặt ở khắp nơi trong lý thuyết xác suất — nhớ lấy nó, vì nó biến nhiều bài toán tưởng khó thành phép cộng đơn giản.

```example[Giếng mọc khuẩn lạc]
Nuôi cấy 10 giếng độc lập, xác suất mỗi giếng mọc là p = 0,3. Số giếng mọc $X \sim \operatorname{Bin}(10, 0{,}3)$: $E[X] = 10 \times 0{,}3 = 3$ và $\operatorname{SD}(X) = \sqrt{10 \times 0{,}3 \times 0{,}7} = \sqrt{2{,}1} \approx 1{,}45$. Kỳ vọng "3 giếng mọc" đi kèm độ lệch chuẩn khoảng 1,45 giếng — thấy 5 giếng mọc không phải điều bất thường, thấy 0 giếng cũng không phải "không thể xảy ra" ($P(X = 0) = 0{,}7^{10} \approx 0{,}028$).
```

```definition[Phân phối Poisson]
Biến đếm $X$ có **phân phối Poisson** với tham số $\lambda > 0$ nếu
$$P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}, \qquad k = 0, 1, 2, \dots$$
```

Poisson xuất hiện khi đếm số sự kiện hiếm, xảy ra độc lập, với tốc độ trung bình $\lambda$ — số khuẩn lạc trên đĩa, số xung phân rã phóng xạ trong một khoảng thời gian, số tế bào trong một ô đếm. Đặc tính đáng nhớ nhất:

```remark[Poisson: kỳ vọng bằng phương sai]
Với $X \sim \operatorname{Poisson}(\lambda)$: $E[X] = \operatorname{Var}(X) = \lambda$. Số đếm Poisson có độ phân tán bằng đúng giá trị trung bình. Hệ quả thực hành quan trọng: nếu bạn đếm khuẩn lạc và thấy phương sai giữa các đĩa **lớn hơn hẳn** trung bình (hiện tượng gọi là phân tán quá mức, overdispersion), thì dữ liệu không thuần Poisson — thường là dấu hiệu có biến thiên sinh học thật giữa các đĩa (khuẩn lạc cụm lại, môi trường không đồng nhất), chứ không chỉ là dao động đếm ngẫu nhiên.
```

```example[Tính xác suất Poisson bằng tay]
Nuôi cấy vi khuẩn cho trung bình $\lambda = 4$ khuẩn lạc trên một đĩa. Xác suất đúng $k$ khuẩn lạc:
$$P(k) = \frac{4^k e^{-4}}{k!} \quad\Rightarrow\quad P(0) = e^{-4} = 0{,}018;\ P(1) = 4e^{-4} = 0{,}073;\ P(2) = \frac{16e^{-4}}{2} = 0{,}147;\ P(3) = \frac{64e^{-4}}{6} = 0{,}195.$$
Đọc: xác suất một đĩa trống trơn (0 khuẩn lạc) chỉ khoảng 1,8%; khoảng 19,5% số đĩa có đúng 3 khuẩn lạc. Tổng $P(0)+\dots+P(8) = 0{,}979$, nên xác suất đĩa có **từ 9 khuẩn lạc trở lên** là $1 - 0{,}979 = 0{,}021$. Nếu một đĩa cho 12 khuẩn lạc, đó là biến cố hiếm dưới mô hình Poisson($\lambda=4$) — tín hiệu cần soi lại quy trình, không phải nhiễu đếm thường.

Phát hiện overdispersion bằng tính tay: đếm 6 đĩa được $1, 2, 3, 5, 8, 9$ khuẩn lạc. Trung bình $= 28/6 = 4{,}67$; phương sai mẫu
$$s^2 = \frac{(1-4{,}67)^2 + \cdots + (9-4{,}67)^2}{5} = \frac{53{,}3}{5} = 10{,}7.$$
Phương sai $10{,}7$ gấp hơn hai lần trung bình $4{,}67$ — trong khi Poisson đòi hỏi chúng **bằng nhau**. Đó là phân tán quá mức: các đĩa không còn đồng nhất độc lập (khuẩn lạc mọc cụm, môi trường không đều, biến thiên sinh học thật), và mọi khoảng tin cậy dựa trên Poisson sẽ quá lạc quan.
```

```definition[Phân phối log-normal]
$X$ có **phân phối log-normal** nếu $\ln X$ có phân phối chuẩn: $X = e^{\mu + \sigma Z}$ với $Z \sim \mathcal{N}(0,1)$. Các đặc trưng:
$$\text{trung vị} = e^{\mu}, \qquad \text{trung bình} = e^{\mu + \sigma^2/2} > e^{\mu}, \qquad \text{mode} = e^{\mu - \sigma^2}.$$
```

Log-normal xuất hiện tự nhiên khi đại lượng là *tích* của nhiều yếu tố nhỏ độc lập (vì tích thành tổng khi lấy log, rồi áp dụng định lý giới hạn trung tâm ở Phần 1) — đúng với nồng độ chất trong mẫu sinh học, hiệu giá kháng thể, thời gian bán thải, kích thước hạt. Đặc tính bất đối xứng của nó rất quan trọng trong thực hành:

<figure style="margin:1.8em 0;"><img src="/img/stats/lognormal.svg" alt="Phân phối log-normal với mode, trung vị, trung bình" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 6 — Phân phối log-normal (μ = 0, σ = 1) lệch phải: mode &lt; trung vị &lt; trung bình. Đuôi dài bên phải kéo trung bình lên trên trung vị — vài giá trị rất lớn "cân" được nhiều giá trị nhỏ.</figcaption></figure>

```remark[Trung bình của log không phải log của trung bình]
Vì phân phối lệch phải, trung bình số học bị vài giá trị cực lớn kéo lên và mô tả sai "mức điển hình". Với dữ liệu log-normal, con số trung tâm đúng là **trung bình nhân (geometric mean)** $= \left(\prod_i x_i\right)^{1/n} = e^{\overline{\ln x}}$ — tức là lấy log, tính trung bình, rồi mũ lên. Quy tắc vàng: $\overline{\ln x} \neq \ln \bar{x}$ (hệ quả của bất đẳng thức Jensen: trung bình của hàm lồi lớn hơn hàm của trung bình).
```

Đây là lý do các bài báo về nồng độ chất chuyển hoá thường báo cáo geometric mean kèm khoảng bách phân vị, không phải trung bình số học ± SD — một khảo sát về sự hiện diện của phân phối log-normal trong các ngành khoa học thực nghiệm có thể đọc ở Limpert và đồng nghiệp [^4].

```example[Geometric mean từ dữ liệu nồng độ thật]
Năm mẫu huyết tương có nồng độ chất chuyển hoá (ng/mL): $4, 6, 8, 12, 30$. Trung bình số học:
$$\bar{x} = \frac{4+6+8+12+30}{5} = 12.$$
Log tự nhiên: $\ln 4 = 1{,}386$, $\ln 6 = 1{,}792$, $\ln 8 = 2{,}079$, $\ln 12 = 2{,}485$, $\ln 30 = 3{,}401$; trung bình của log: $\overline{\ln x} = 2{,}229$. Trung bình nhân:
$$\text{GM} = e^{2{,}229} = 9{,}29.$$
Ba con số trung tâm: **median = 8**, **GM = 9,29**, **trung bình số học = 12**. Chỉ một mẫu lớn (30) kéo trung bình số học lên 12 trong khi mức điển hình (median, GM) chỉ khoảng 8–9 — đây là lý do dữ liệu nồng độ lệch phải được báo cáo bằng GM kèm khoảng bách phân vị, không phải trung bình số học ± SD.
```

## Phần C — Từ mô hình đến thực hành

### Mô hình đo lường: giá trị thật cộng sai số

Phần 1 mở đầu bằng "mọi phép đo đều có sai số". Giờ ta có ngôn ngữ để viết câu đó thành công thức:

```definition[Mô hình đo lường]
Một phép đo $X$ được mô hình hoá thành
$$X = \mu + \varepsilon,$$
trong đó $\mu$ là giá trị thật (hằng số) và $\varepsilon$ là sai số ngẫu nhiên với $E[\varepsilon] = 0$.
```

Hệ quả tức thì: $E[X] = \mu + E[\varepsilon] = \mu$ — kỳ vọng của phép đo đúng bằng giá trị thật; và $\operatorname{Var}(X) = \operatorname{Var}(\varepsilon)$ — biến thiên của phép đo chính là biến thiên của sai số. Nói gọn: *đo lặp lại cho ta thông tin về phân phối của sai số*. Đây chính là nền tảng lý thuyết cho mọi thứ Phần 1 đã làm: các lần lặp độc lập ước lượng $\operatorname{Var}(\varepsilon)$, từ đó có SEM và khoảng tin cậy.

### Lưu ý thực hành

Năm điểm dễ nhầm nhất, tổng hợp từ cả hai phần:

1. **$\bar{x}$ là số liệu, $\mu$ là tham số.** $\bar{x}$ bạn tính được từ mẫu; $\mu$ là đặc tính của phân phối, không bao giờ quan sát trực tiếp. Viết $\mu = 42{,}23$ µg/mL là sai về bản chất — đúng phải là "$\bar{x} = 42{,}23$, ước lượng của $\mu$".
2. **Phương sai có đơn vị bình phương.** Nếu dữ liệu là mg/L, phương sai là (mg/L)² — con số khó đọc và không so sánh được với dữ liệu; báo cáo độ lệch chuẩn (cùng đơn vị) là thói quen đúng.
3. **Trung bình của log ≠ log của trung bình** (mục log-normal ở trên). Với nồng độ, dùng geometric mean.
4. **$\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$ cần độc lập.** Đo sáu giếng từ cùng một dung dịch mẹ không cho sáu thông tin độc lập — chúng tương quan, và phương sai của tổng không phải tổng các phương sai. Đây là hệ quả toán học của lưu ý "lặp kỹ thuật vs lặp sinh học" ở Phần 1.
5. **$f(x)$ có thể lớn hơn 1** (đã nói ở mục PDF) — đừng hoảng khi thấy chiều cao đường mật độ vượt quá 1; xác suất luôn là diện tích.

### Lộ trình tiếp theo

Phần 2 đã đưa ba con số của Phần 1 về đúng chỗ: chúng là ước lượng của $E[X]$, $\operatorname{Var}(X)$, $\operatorname{SD}(X)$ — các đặc trưng của phân phối sinh ra dữ liệu. Còn lại một mảnh ghép quan trọng: chính các phân phối đó (chuẩn, t, χ², F) là thứ làm nên toàn bộ máy suy luận ở Phần 1 — khoảng tin cậy dùng $t$, kiểm định χ² dùng phân phối χ², ANOVA dùng $F$. Các phần tiếp theo của loạt bài sẽ: (1) đi sâu hơn vào từng phân phối và khi nào dùng chúng; (2) lan truyền sai số (propagation of error) — khi kết hợp nhiều phép đo, phương sai kết hợp thế nào, rất thiết thực cho hoá phân tích; (3) các giả định của hồi quy dưới ánh sáng mô hình $X = \mu + \varepsilon$. Nền móng xác suất ở bài này là thứ làm cho những phần đó trở nên rõ ràng thay vì "công thức tra bảng". Với ai muốn đọc sâu hơn: *A First Course in Probability* của Ross [^2] là giáo trình nhẹ nhàng, *Probability and Random Processes* của Grimmett và Stirzaker [^1] chặt chẽ hơn, *Statistical Inference* của Casella và Berger [^3] cho toàn bộ máy suy luận phía sau, còn *An Introduction to Probability Theory and Its Applications* của Feller [^5] là kinh điển về các định lý giới hạn.

[^1]: Geoffrey Grimmett, David Stirzaker, *Probability and Random Processes*, 3rd ed., Oxford University Press, 2001.
[^2]: Sheldon Ross, *A First Course in Probability*, 10th ed., Pearson, 2019.
[^3]: George Casella, Roger Berger, *Statistical Inference*, 2nd ed., Duxbury, 2002.
[^4]: Eckhard Limpert, Werner Stahel, Markus Abbt, "Log-normal distributions across the sciences: keys and clues," *BioScience* 51(5): 341–352, 2001.
[^5]: William Feller, *An Introduction to Probability Theory and Its Applications*, Vol. 1, 3rd ed., Wiley, 1968.
[^6]: Jacob Bernoulli, *Ars Conjectandi*, 1713.
[^7]: Andrey Kolmogorov, *Grundbegriffe der Wahrscheinlichkeitsrechnung*, Springer, 1933.
