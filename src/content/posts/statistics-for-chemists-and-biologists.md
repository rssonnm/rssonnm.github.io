---
title: "Thống kê cơ bản cho khoa học sự sống"
date: 2026-08-10T08:00:00
description: "Mọi phép đo đều có sai số, và thống kê là ngôn ngữ để nói về sai số đó một cách chính xác. Bài viết dạy từ đầu: mô tả dữ liệu, phân phối chuẩn và định lý giới hạn trung tâm, khoảng tin cậy, kiểm định giả thuyết, ANOVA, kiểm định χ², tương quan và hồi quy — mỗi công thức đều được diễn giải từng thành phần, có chứng minh và ví dụ hoá học, sinh học cụ thể."
topic: mathematics
tags: [statistics, data-analysis, hypothesis-testing, regression, research-methods, tutorial]
featured: false
draft: false
---

Bạn đo nồng độ protein bằng Bradford assay, lặp lại sáu lần và thu được sáu con số khác nhau. Bạn so sánh hoạt tính enzyme giữa lô đối chứng và lô xử lý, và muốn biết sự khác biệt có "ý nghĩa" hay không. Bạn dựng đường chuẩn HPLC và cần ước lượng nồng độ của một mẫu chưa biết kèm theo sai số. Ba tình huống này có chung một cấu trúc: bạn có dữ liệu từ một **mẫu** nhỏ, nhưng câu hỏi khoa học của bạn nói về một **quần thể** lớn hơn — và giữa hai thứ đó luôn có sai số do ngẫu nhiên. Thống kê là bộ công cụ để đi từ mẫu đến kết luận một cách có kiểm soát, định lượng được độ chắc chắn của kết luận.

Bài viết này dành cho người mới bắt đầu, không đòi hỏi kiến thức xác suất từ trước — chỉ cần đại số. Mỗi khái niệm được trình bày theo cùng một trình tự: định nghĩa chính xác, công thức được tách ra từng thành phần và diễn giải, một ví dụ cụ thể trong hoá học hoặc sinh học, rồi một lỗi hiểu sai thường gặp. Các thuật ngữ có chú thích tiếng Anh ở lần xuất hiện đầu tiên, vì bạn sẽ gặp chúng trong bài báo và phần mềm thống kê.

## Quần thể, mẫu và hai câu hỏi của thống kê

```definition[Quần thể và mẫu]
**Quần thể (population)** là tập hợp toàn bộ các đối tượng — hoặc toàn bộ các phép đo có thể có — mà ta muốn rút ra kết luận. **Mẫu (sample)** là tập con của quần thể mà ta thực sự quan sát được. Số lượng phần tử của mẫu, ký hiệu $n$, được gọi là cỡ mẫu.
```

Ví dụ: bạn nghiên cứu nồng độ glucose máu của chuột nhắt giống C57BL/6. Quần thể là *mọi con chuột C57BL/6 có thể có* — về nguyên tắc là vô hạn, và bạn không bao giờ đo được hết. Mẫu là 8 con chuột bạn thực sự nuôi và đo. Tương tự, khi bạn đo IC50 của một hợp chất, quần thể là mọi kết quả IC50 có thể thu được nếu lặp lại thí nghiệm vô hạn lần; mẫu là vài lần chạy bạn làm được trong phòng thí nghiệm.

Hai câu hỏi lớn của thống kê:

1. **Thống kê mô tả (descriptive statistics)** — tóm tắt mẫu bằng vài con số: giá trị trung tâm, độ phân tán. Câu trả lời chỉ nói về mẫu bạn đang có.
2. **Suy luận thống kê (inferential statistics)** — từ mẫu, kết luận về quần thể, kèm theo độ không chắc chắn: khoảng tin cậy, kiểm định giả thuyết, mô hình hồi quy.

Điều kiện để suy luận có giá trị là mẫu phải **đại diện** cho quần thể — lý tưởng là mẫu ngẫu nhiên, và quan trọng nhất là các quan sát phải **độc lập** với nhau. Nếu bạn đo sáu giếng trên cùng một đĩa 96 giếng từ một dung dịch mẹ, sáu số liệu đó không phải sáu thông tin độc lập: chúng là sáu lần lặp của *một* dung dịch. Sự khác biệt giữa "lặp kỹ thuật" (technical replicates) và "lặp sinh học" (biological replicates) quyết định mức độ bạn được phép khái quát hoá — đây là một trong những nguồn sai lầm phổ biến nhất trong các bài báo sinh học.

## Mô tả dữ liệu: trung tâm và độ phân tán

### Trung bình và trung vị

```definition[Trung bình mẫu]
Cho mẫu $x_1, x_2, \dots, x_n$, **trung bình mẫu (sample mean)** là
$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i.$$
```

Công thức đọc là: cộng tất cả giá trị lại rồi chia cho số lượng. Về mặt hình học, $\bar{x}$ là **điểm cân bằng** của dữ liệu: nếu đặt các giá trị lên một thanh có khối lượng bằng nhau tại mỗi điểm, $\bar{x}$ là vị trí giữ thăng bằng. Điểm cân bằng này nhạy cảm với các giá trị cực trị: kéo một giá trị ra xa, thanh nghiêng theo.

```definition[Trung vị]
Sắp xếp mẫu theo thứ tự tăng dần. **Trung vị (median)** là giá trị ở giữa dãy: với $n$ lẻ, là giá trị thứ $(n+1)/2$; với $n$ chẵn, là trung bình của hai giá trị ở giữa.
```

Khác với trung bình, trung vị chỉ phụ thuộc vào *thứ tự* của dữ liệu, không phụ thuộc vào độ lớn của các giá trị ngoài cùng. Vì vậy trung vị **bền vững (robust)** với giá trị ngoại lai, còn trung bình thì không.

```example[Ngoại lai làm lệch trung bình]
Bạn đo nồng độ một chất chuyển hoá (metabolite) trong 5 mẫu huyết tương, đơn vị µmol/L:
$$4{,}1,\; 4{,}3,\; 4{,}0,\; 4{,}2,\; 15{,}8.$$
Giá trị $15{,}8$ đến từ một mẫu bị vỡ hồng cầu (hemolysis) — không phải hiện tượng sinh lý thật. Trung bình mẫu là $(4{,}1+4{,}3+4{,}0+4{,}2+15{,}8)/5 = 6{,}5$, trong khi trung vị là $4{,}2$. Một giá trị duy nhất đã đẩy trung bình tăng 55%. Nếu báo cáo trung bình ở đây, bạn đang mô tả sai quần thể.
```

Quy tắc thực hành: nếu phân phối của dữ liệu đối xứng, trung bình và trung vị gần như trùng nhau và đều dùng được; nếu dữ liệu lệch mạnh (ví dụ thời gian phản ứng, nồng độ — thường lệch phải), trung vị mô tả "trường hợp điển hình" trung thực hơn.

### Phương sai và độ lệch chuẩn

Trung bình cho biết dữ liệu nằm *ở đâu*; ta cần một con số cho biết dữ liệu *phân tán thế nào*. Ý tưởng tự nhiên là đo khoảng cách từ mỗi điểm đến trung bình, $x_i - \bar{x}$, rồi lấy trung bình các khoảng cách đó. Nhưng tổng các độ lệch luôn bằng 0 — các độ lệch dương và âm triệt tiêu nhau. Giải pháp: bình phương chúng trước khi cộng.

```definition[Phương sai mẫu và độ lệch chuẩn]
**Phương sai mẫu (sample variance)** là
$$s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2,$$
và **độ lệch chuẩn (standard deviation, SD)** là $s = \sqrt{s^2}$.
```

Hai chi tiết trong công thức cần giải thích kỹ.

*Thứ nhất, tại sao bình phương?* Ba lý do. (a) Bình phương làm mọi số hạng không âm, nên tổng không bị triệt tiêu. (b) Bình phương phạt các độ lệch lớn nặng hơn các độ lệch nhỏ: một điểm cách trung bình 2 đơn vị đóng góp 4 vào tổng, gấp bốn lần một điểm cách 1 đơn vị. Điều này phản ánh trực giác rằng "sai số lớn gấp đôi" nên bị coi là "tệ hơn gấp đôi" — và sau này hoá ra nó đúng về mặt lý thuyết khi dữ liệu là chuẩn. (c) Bình phương làm công thức khả vi, cho phép dùng giải tích để suy ra các ước lượng tối ưu — như phần hồi quy sẽ thấy.

*Thứ hai, tại sao chia cho $n-1$ chứ không phải $n$?* Vì trung bình mẫu $\bar{x}$ không phải trung bình quần thể $\mu$. Trước tiên, một bổ đề:

```lemma[Trung bình mẫu là điểm cực tiểu của tổng bình phương]
Với mọi số $c$,
$$\sum_{i=1}^{n}(x_i - c)^2 \ge \sum_{i=1}^{n}(x_i - \bar{x})^2,$$
dấu bằng xảy ra khi $c = \bar{x}$.
```

```proof
Xét hàm $f(c) = \sum_i (x_i - c)^2$. Đạo hàm:
$$f'(c) = -2\sum_i (x_i - c) = -2\left(\sum_i x_i - nc\right).$$
Cho $f'(c) = 0$ ta được $c = \frac{1}{n}\sum_i x_i = \bar{x}$, và $f''(c) = 2n > 0$ nên đây là điểm cực tiểu toàn cục.
```

Hệ quả trực tiếp: các độ lệch tính từ $\bar{x}$ luôn *nhỏ hơn hoặc bằng* các độ lệch tính từ $\mu$ thật. Nói cách khác, $\frac{1}{n}\sum_i (x_i-\bar{x})^2$ có xu hướng **đánh giá thấp** phương sai quần thể $\sigma^2$, vì dữ liệu luôn "gần" trung bình mẫu của chính nó hơn là gần trung bình quần thể. Chia cho $n-1$ thay vì $n$ là sự đền bù chính xác cho độ lệch hệ thống này:

```lemma[Hiệu chỉnh Bessel: $s^2$ là ước lượng không chệch của $\sigma^2$]
Nếu $X_1, \dots, X_n$ độc lập, cùng phân phối với trung bình $\mu$ và phương sai $\sigma^2$, thì
$$\mathbb{E}[s^2] = \sigma^2.$$
```

```proof
Khai triển tổng bình phương:
$$\sum_i (X_i - \bar{X})^2 = \sum_i X_i^2 - n\bar{X}^2.$$
Lấy kỳ vọng từng vế. Vì $\mathbb{E}[X_i^2] = \mu^2 + \sigma^2$ nên $\mathbb{E}[\sum_i X_i^2] = n(\mu^2 + \sigma^2)$. Còn $\mathbb{E}[\bar{X}] = \mu$ và $\operatorname{Var}(\bar{X}) = \sigma^2/n$, suy ra $\mathbb{E}[\bar{X}^2] = \mu^2 + \sigma^2/n$. Vậy
$$\mathbb{E}\left[\sum_i (X_i-\bar{X})^2\right] = n(\mu^2+\sigma^2) - n\left(\mu^2 + \frac{\sigma^2}{n}\right) = (n-1)\sigma^2.$$
Chia cả hai vế cho $n-1$ được $\mathbb{E}[s^2] = \sigma^2$.
```

Thuật ngữ: chia cho $n-1$ gọi là **hiệu chỉnh Bessel (Bessel's correction)**. Số $n-1$ còn được gọi là **bậc tự do (degrees of freedom, df)** — trực giác: trong $n$ độ lệch $x_i - \bar{x}$, chỉ có $n-1$ độc lập, vì tổng của chúng bằng 0 nên biết $n-1$ cái là suy ra cái còn lại.

Độ lệch chuẩn $s$ có cùng đơn vị với dữ liệu gốc (phương sai thì có đơn vị bình phương — ví dụ nếu dữ liệu là mg/L thì phương sai là (mg/L)², khó đọc), nên $s$ là con số thường được báo cáo.

```example[Tính tay với dữ liệu Bradford]
Sáu lần đo nồng độ protein của cùng một mẫu, đơn vị µg/mL:
$$42{,}3;\; 41{,}8;\; 43{,}1;\; 42{,}0;\; 41{,}5;\; 42{,}7.$$
Trung bình: $\bar{x} = 253{,}4/6 = 42{,}23$ µg/mL. Các độ lệch $x_i - \bar{x}$: $0{,}07;\; -0{,}43;\; 0{,}87;\; -0{,}23;\; -0{,}73;\; 0{,}47$; bình phương chúng rồi cộng lại được $\approx 1{,}75$. Vậy
$$s^2 = \frac{1{,}75}{6-1} = 0{,}35,\qquad s = 0{,}59\ \text{µg/mL}.$$
Nếu lỡ chia cho 6, ta được $s^2 = 0{,}29$ — nhỏ hơn, đúng như phân tích ở trên: chia $n$ luôn cho kết quả hơi thấp so với $\sigma^2$.
```

Khi dữ liệu xấp xỉ chuẩn (xem phần sau), quy tắc 68–95–99,7 cho phép đọc nhanh độ lệch chuẩn: khoảng 68% số quan sát nằm trong $\bar{x} \pm s$, khoảng 95% nằm trong $\bar{x} \pm 2s$, khoảng 99,7% nằm trong $\bar{x} \pm 3s$.

<figure style="margin:1.8em 0;"><img src="/img/stats/norm-curve.svg" alt="Phân phối chuẩn với các vùng 68, 95 và 99,7%" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Phân phối chuẩn tắc: khoảng 68% diện tích dưới đường cong nằm trong μ ± σ, 95% trong μ ± 2σ, 99,7% trong μ ± 3σ.</figcaption></figure>

### SD hay SEM?

```definition[Sai số chuẩn của trung bình]
**Sai số chuẩn của trung bình (standard error of the mean, SEM)** là
$$\mathrm{SEM} = \frac{s}{\sqrt{n}}.$$
```

Đây là chỗ gây nhầm lẫn nhiều nhất trong các bài báo hoá – sinh. SD và SEM trả lời hai câu hỏi khác nhau:

- **SD** mô tả mức phân tán của *các quan sát riêng lẻ* quanh trung bình. Nó ước lượng $\sigma$ — một đặc tính của quần thể, không phụ thuộc vào việc bạn đo 3 lần hay 30 lần.
- **SEM** mô tả độ chính xác của *ước lượng trung bình*. Nếu lặp lại toàn bộ thí nghiệm nhiều lần, các trung bình mẫu thu được sẽ dao động quanh $\mu$ với độ lệch chuẩn $\sigma/\sqrt{n}$. SEM là ước lượng của con số đó.

Hệ quả quan trọng: tăng cỡ mẫu làm SEM giảm (chia cho $\sqrt{n}$) nhưng **không làm SD thay đổi** — vì bản thân dữ liệu không phân tán hơn. Một hình với thanh lỗi (error bar) dùng SEM sẽ trông "đẹp" hơn khi tăng $n$, nhưng nó không cho biết dữ liệu thật phân tán thế nào.

```example[SD không đổi, SEM co lại]
Giả sử một thí nghiệm có $s = 0{,}59$ như ví dụ Bradford. Với $n = 6$: $\mathrm{SEM} = 0{,}59/\sqrt{6} = 0{,}24$. Nếu lặp lại đủ để có $n = 24$ mà độ phân tán vẫn là $s = 0{,}59$: $\mathrm{SEM} = 0{,}59/\sqrt{24} = 0{,}12$ — giảm một nửa, dù dữ liệu chẳng "sạch" hơn chút nào.
```

Quy ước trình bày: trong bài báo, báo cáo dạng "trung bình ± SD" khi muốn mô tả biến thiên của dữ liệu, "trung bình ± SEM" khi muốn so sánh trung bình giữa các nhóm — và phải **ghi rõ bạn dùng cái nào**. Nhiều tạp chí sinh học (như *Nature*) yêu cầu nêu rõ và khuyến khích vẽ dữ liệu thô thay vì chỉ vẽ trung bình.

<figure style="margin:1.8em 0;"><img src="/img/stats/sd-vs-sem.svg" alt="So sánh SD và SEM" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — SD mô tả độ phân tán của từng quan sát (đường rộng); SEM mô tả độ chính xác của trung bình mẫu (đường hẹp): SEM = SD/√n luôn nhỏ hơn SD.</figcaption></figure>

## Phân phối chuẩn và định lý giới hạn trung tâm

### Công thức của phân phối chuẩn

```definition[Phân phối chuẩn]
Biến ngẫu nhiên $X$ có **phân phối chuẩn (normal distribution)** với trung bình $\mu$ và phương sai $\sigma^2$, ký hiệu $X \sim \mathcal{N}(\mu, \sigma^2)$, nếu hàm mật độ xác suất của nó là
$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right).$$
```

Đọc công thức từng phần:

- Phần $\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$ là một "cái chuông": tại $x = \mu$ số mũ bằng $e^0 = 1$ — giá trị lớn nhất; càng xa $\mu$, số mũ càng âm, giá trị càng nhỏ. Hằng số $2$ trong mẫu số chỉ là quy ước để độ rộng của chuông khớp với khái niệm độ lệch chuẩn.
- Thừa số $\frac{1}{\sigma\sqrt{2\pi}}$ là hằng số chuẩn hoá: nó đảm bảo diện tích dưới toàn bộ đường cong bằng 1, vì tổng xác suất của mọi giá trị phải bằng 1. Có thể kiểm chứng bằng tích phân Gauss $\int_{-\infty}^{\infty} e^{-t^2/2}\,dt = \sqrt{2\pi}$ — chính là lý do $\pi$ xuất hiện trong công thức xác suất.
- Tham số $\mu$ dịch chuyển chuông sang trái/phải; $\sigma$ kéo dãn hoặc nén chuông. Đổi biến $z = (x-\mu)/\sigma$ đưa mọi phân phối chuẩn về **phân phối chuẩn tắc (standard normal)** $\mathcal{N}(0,1)$; giá trị $z$ đọc là "cách trung bình bao nhiêu độ lệch chuẩn".

### Định lý giới hạn trung tâm

Vì sao phân phối chuẩn xuất hiện ở khắp nơi — sai số đo, đặc điểm sinh học, trung bình mẫu? Câu trả lời là định lý giới hạn trung tâm, một trong những kết quả trung tâm của xác suất:

```theorem[Định lý giới hạn trung tâm (CLT)]
Cho $X_1, \dots, X_n$ độc lập, cùng phân phối, với trung bình $\mu$ và phương sai hữu hạn $\sigma^2$. Khi $n$ lớn, trung bình mẫu $\bar{X}$ xấp xỉ chuẩn:
$$\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0,1).$$
```

Nội dung định lý, diễn giải bằng lời: **trung bình của nhiều biến ngẫu nhiên độc lập, dù mỗi biến có phân phối gì đi nữa, sẽ có phân phối gần như chuẩn khi số lượng đủ lớn.** Không cần biết phân phối gốc — chỉ cần nó có phương sai hữu hạn. Đây là lý do sâu xa khiến sai số đo lường (tổng của nhiều nguồn nhiễu nhỏ độc lập) và nhiều đại lượng sinh học (tổng của nhiều yếu tố di truyền và môi trường) nhìn như chuẩn.

Có hai điều cần lưu ý để dùng CLT đúng cách:

- Tốc độ hội tụ phụ thuộc vào mức độ lệch của phân phối gốc. Quy tắc ngón tay cái "n ≥ 30 là đủ" chỉ đúng cho phân phối gốc không quá lệch; nếu dữ liệu gốc lệch mạnh (ví dụ nồng độ, thời gian, số đếm), cần $n$ lớn hơn nhiều hoặc nên dùng các phương pháp bền vững.
- CLT nói về $\bar{X}$ — không phải về từng quan sát. Dữ liệu gốc có thể rất không chuẩn mà trung bình mẫu vẫn chuẩn khi $n$ đủ lớn.

### Từ $z$ đến $t$

Nếu biết $\sigma$ (hiếm khi xảy ra trong thực tế), đại lượng $Z = \frac{\bar{X}-\mu}{\sigma/\sqrt{n}}$ có phân phối chuẩn tắc. Nhưng ta chỉ có $s$ — ước lượng của $\sigma$, và $s$ bản thân nó là biến ngẫu nhiên. Thay $\sigma$ bằng $s$ làm phân phối của tỉ số trở nên "béo đuôi" hơn: các giá trị cực trị xảy ra thường xuyên hơn chuẩn, vì mẫu số cũng dao động. Kết quả chính xác (khi dữ liệu gốc chuẩn):

```definition[Phân phối $t$ của Student]
Nếu $X_1, \dots, X_n$ độc lập, cùng phân phối $\mathcal{N}(\mu, \sigma^2)$, thì
$$T = \frac{\bar{X} - \mu}{s/\sqrt{n}}$$
có **phân phối $t$ với $n-1$ bậc tự do**, ký hiệu $t_{n-1}$.
```

Phân phối $t$ do William Sealy Gosset công bố năm 1908 dưới bút danh "Student" [^8]. Nó đối xứng quanh 0 như chuẩn tắc nhưng đuôi dày hơn; khi $n$ tăng, $s$ càng chắc chắn gần $\sigma$, và $t_{n-1}$ tiến dần về $\mathcal{N}(0,1)$. Hệ quả thực hành: với mẫu nhỏ, phải "đi xa hơn" khỏi 0 mới đạt cùng mức ý nghĩa — đây chính là lý do các khoảng tin cậy và kiểm định dùng $t$ chứ không dùng $z$ khi $\sigma$ phải ước lượng.

<figure style="margin:1.8em 0;"><img src="/img/stats/t-vs-normal.svg" alt="Phân phối t so với chuẩn tắc" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Phân phối t với 5 bậc tự do (teal) so với chuẩn tắc (vàng): đuôi dày hơn — giá trị cực đoan xảy ra thường xuyên hơn vì $s$ cũng là một đại lượng ngẫu nhiên.</figcaption></figure>

## Khoảng tin cậy

Trung bình mẫu $\bar{x} = 42{,}23$ µg/mL là một con số cụ thể, nhưng nó là ước lượng của $\mu$ — và bản thân nó dao động với độ lệch chuẩn $\mathrm{SEM} = s/\sqrt{n}$. Thay vì nói "$\mu = 42{,}23$", ta nói "$\mu$ nằm trong khoảng từ X đến Y, với độ tin cậy 95%". Khoảng đó gọi là khoảng tin cậy.

```definition[Khoảng tin cậy cho trung bình]
Khoảng tin cậy $100(1-\alpha)\%$ cho trung bình quần thể $\mu$ là
$$\bar{x} \pm t_{\alpha/2,\,n-1}\,\frac{s}{\sqrt{n}},$$
trong đó $t_{\alpha/2,\,n-1}$ là giá trị tới hạn của phân phối $t$ với $n-1$ bậc tự do, cắt $\alpha/2$ diện tích ở mỗi đuôi.
```

Các thành phần: $\bar{x}$ là tâm; $\mathrm{SEM} = s/\sqrt{n}$ là độ không chắc chắn của ước lượng; $t_{\alpha/2,n-1}$ là "hệ số phóng đại" để đạt mức tin cậy mong muốn — với 95% ($\alpha = 0{,}05$) và $n$ lớn, $t \approx 1{,}96$; với $n$ nhỏ, $t$ lớn hơn hẳn (ví dụ $n = 5$, $t_{0{,}025,4} = 2{,}78$), phản ánh sự kém chắc chắn khi ước lượng $\sigma$ từ ít dữ liệu.

```example[Khoảng tin cậy của IC50]
Bạn đo IC50 của một hợp chất ức chế, đơn vị µM, được $\bar{x} = 12{,}4$ và $s = 2{,}1$ với $n = 6$. Với $n-1 = 5$ bậc tự do, $t_{0{,}025,5} = 2{,}571$:
$$\mathrm{SEM} = \frac{2{,}1}{\sqrt{6}} = 0{,}86,\qquad 12{,}4 \pm 2{,}571 \times 0{,}86 = 12{,}4 \pm 2{,}2,$$
tức khoảng tin cậy 95% là $[10{,}2;\; 14{,}6]$ µM. Nếu chỉ đo $n = 3$ (và $s$ vẫn là 2,1), khoảng là $12{,}4 \pm 4{,}303 \times 1{,}21 = [7{,}2;\; 17{,}6]$ — rộng hơn nhiều, đúng như trực giác: ít dữ liệu thì kết luận kém chắc chắn.
```

Diễn giải đúng của khoảng tin cậy 95% — và đây là chỗ rất nhiều người — kể cả tác giả bài báo — hiểu sai:

```remark[Diễn giải chính xác khoảng tin cậy]
Khoảng tin cậy 95% **không** có nghĩa là "xác suất $\mu$ nằm trong khoảng này là 95%". $\mu$ là một hằng số — nó hoặc nằm trong khoảng, hoặc không, không có xác suất. Ý nghĩa đúng thuộc về *quá trình*: nếu lặp lại thí nghiệm nhiều lần và mỗi lần dựng một khoảng theo cùng công thức, thì khoảng 95% số khoảng như vậy sẽ chứa $\mu$. Nói gọn: tin cậy nằm ở phương pháp, không nằm ở một khoảng cụ thể.

<figure style="margin:1.8em 0;"><img src="/img/stats/ci.svg" alt="20 khoảng tin cậy, 1 khoảng không chứa μ" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — Mô phỏng 20 lần lặp thí nghiệm: mỗi khoảng là x̄ ± t·s/√n quanh đường thẳng đứng μ. Khoảng vàng bỏ lỡ μ — đúng như dự kiến: 19/20 ≈ 95%.</figcaption></figure>
```

Một hệ quả hữu ích: khoảng tin cậy và kiểm định giả thuyết là hai mặt của cùng một đồng xu — với kiểm định hai phía mức $\alpha$, khoảng tin cậy $100(1-\alpha)\%$ **không chứa** giá trị kiểm định $\mu_0$ khi và chỉ khi kiểm định bác bỏ $H_0$. Vì vậy một khoảng tin cậy thông tin nhiều hơn một con số $p$: nó cho biết cả độ lớn lẫn độ chắc chắn của hiệu ứng, còn $p$ chỉ cho biết độ chắc chắn.

## Kiểm định giả thuyết

### Khung khái niệm: $H_0$, p-value, sai lầm loại I và II

```definition[Giả thuyết không và đối thuyết]
**Giả thuyết không (null hypothesis, $H_0$)** là khẳng định "không có hiệu ứng": hai nhóm bằng nhau, tham số bằng một giá trị quy định, biến này không liên quan biến kia. **Đối thuyết (alternative hypothesis, $H_1$)** là điều ngược lại mà nhà nghiên cứu muốn chứng minh.
```

```definition[Giá trị $p$]
**Giá trị $p$ (p-value)** là xác suất thu được dữ liệu "cực đoan như hoặc cực đoan hơn" dữ liệu quan sát được, **giả sử $H_0$ đúng**.
```

Định nghĩa này có hai thành phần cần nhấn mạnh. Thứ nhất, p-value được tính *trong thế giới giả định $H_0$ đúng* — nó không phải xác suất $H_0$ đúng, cũng không phải xác suất $H_1$ đúng. Thứ hai, nó bao gồm "cực đoan hơn", không chỉ riêng dữ liệu quan sát được — vì nếu chỉ tính xác suất của một kết quả cụ thể thì gần như luôn rất nhỏ, vô nghĩa.

Logic của kiểm định: chọn một mức ý nghĩa $\alpha$ (thường 0,05) trước khi phân tích; nếu $p < \alpha$, dữ liệu khó xảy ra đến mức khó dung hoà với $H_0$, ta **bác bỏ $H_0$** và coi hiệu ứng là "có ý nghĩa thống kê". Nếu $p \ge \alpha$, ta **không bác bỏ $H_0$** — lưu ý đây không phải "chứng minh $H_0$ đúng", chỉ là "dữ liệu không đủ sức thuyết phục để bác bỏ".

```definition[Sai lầm loại I, loại II và công suất]
- **Sai lầm loại I (type I error)**: bác bỏ $H_0$ khi $H_0$ thật sự đúng — "báo cáo hiệu ứng không có thật". Xác suất của nó đúng bằng $\alpha$.
- **Sai lầm loại II (type II error)**: không bác bỏ $H_0$ khi $H_0$ thật sự sai — "bỏ sót hiệu ứng có thật". Xác suất của nó là $\beta$.
- **Công suất (power)** $= 1 - \beta$: xác suất phát hiện được một hiệu ứng có thật với độ lớn cho trước.
```

$\alpha$ do nhà nghiên cứu chọn (0,05 hay 0,01); $\beta$ phụ thuộc vào cỡ mẫu, độ lớn hiệu ứng thật và độ phân tán — không chọn trực tiếp được. Một thí nghiệm với công suất thấp (mẫu nhỏ, hiệu ứng nhỏ) gần như chắc chắn cho $p > 0{,}05$ dù hiệu ứng có thật — và $p$ lớn trong trường hợp đó không hề là bằng chứng cho $H_0$.

### t-test một mẫu

```definition[Thống kê $t$ một mẫu]
Để kiểm định $H_0: \mu = \mu_0$ với $\mu_0$ là một giá trị quy định, dùng
$$t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}},$$
so sánh với phân phối $t_{n-1}$ (kiểm định hai phía: $|t| \ge t_{\alpha/2,n-1}$ thì bác bỏ $H_0$).
```

Tử số là độ lệch giữa ước lượng và giá trị giả định; mẫu số là độ không chắc chắn của ước lượng đó. Tỉ số này đọc là "ước lượng lệch khỏi giá trị giả định bao nhiêu lần sai số chuẩn". Lệch càng nhiều lần SEM, dữ liệu càng khó dung hoà với $H_0$.

```example[Kiểm chuẩn thiết bị]
Một máy phân tích có chứng nhận đo chuẩn nồng độ $10{,}0$ mg/L. Bạn chạy $n = 8$ lần, được $\bar{x} = 10{,}6$ mg/L, $s = 0{,}7$ mg/L. Kiểm định $H_0: \mu = 10{,}0$:
$$t = \frac{10{,}6 - 10{,}0}{0{,}7/\sqrt{8}} = \frac{0{,}6}{0{,}247} = 2{,}42.$$
Với $n-1 = 7$ bậc tự do, giá trị tới hạn hai phía mức 0,05 là $t_{0{,}025,7} = 2{,}365$. Vì $2{,}42 > 2{,}365$ nên $p < 0{,}05$: máy lệch khỏi giá trị chứng nhận một cách có ý nghĩa thống kê — cần hiệu chuẩn lại.
```

### t-test hai mẫu độc lập

```definition[Thống kê $t$ hai mẫu độc lập]
Cho hai nhóm độc lập với trung bình $\bar{x}_1, \bar{x}_2$, cỡ mẫu $n_1, n_2$ và phương sai mẫu $s_1^2, s_2^2$. Nếu giả định hai quần thể có cùng phương sai, gộp phương sai:
$$s_p^2 = \frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1 + n_2 - 2},$$
và
$$t = \frac{\bar{x}_1 - \bar{x}_2}{s_p\sqrt{\frac{1}{n_1} + \frac{1}{n_2}}},$$
với $n_1 + n_2 - 2$ bậc tự do.
```

$s_p^2$ là trung bình có trọng số của hai phương sai, trọng số theo bậc tự do — nhóm có nhiều dữ liệu hơn đóng góp nhiều hơn. Mẫu số $\sqrt{1/n_1 + 1/n_2}$ là sai số chuẩn của hiệu $\bar{x}_1 - \bar{x}_2$: vì hai nhóm độc lập nên phương sai của hiệu bằng tổng hai phương sai, $\sigma^2(1/n_1 + 1/n_2)$.

Khi hai quần thể có phương sai khác nhau rõ rệt (kiểm định F về phương sai, hoặc đơn giản là $s_1$ và $s_2$ chênh nhau nhiều), dùng kiểm định **Welch** [^6]: $t = \frac{\bar{x}_1-\bar{x}_2}{\sqrt{s_1^2/n_1 + s_2^2/n_2}}$ với bậc tự do tính theo công thức Welch–Satterthwaite. Welch an toàn hơn khi mẫu nhỏ và phương sai không bằng nhau, và nhiều phần mềm (R, Python `scipy`) mặc định dùng nó.

```example[So sánh hai quy trình tổng hợp]
Hai quy trình tổng hợp cùng một hợp chất, mỗi quy trình lặp 5 lần, hiệu suất (%):
nhóm 1: $\bar{x}_1 = 100{,}0,\ s_1 = 6$; nhóm 2: $\bar{x}_2 = 112{,}0,\ s_2 = 7$. Kiểm định $H_0$: hai quy trình cho hiệu suất trung bình bằng nhau.
$$s_p^2 = \frac{4 \cdot 36 + 4 \cdot 49}{8} = 42{,}5,\qquad s_p = 6{,}52,$$
$$t = \frac{100 - 112}{6{,}52\sqrt{1/5 + 1/5}} = \frac{-12}{6{,}52 \times 0{,}632} = -2{,}91.$$
Với 8 bậc tự do, $t_{0{,}025,8} = 2{,}306$; $|t| = 2{,}91 > 2{,}306$, nên $p < 0{,}05$: quy trình 2 cho hiệu suất cao hơn có ý nghĩa thống kê.

<figure style="margin:1.8em 0;"><img src="/img/stats/ttest.svg" alt="Hai phân phối trong t-test hai mẫu" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 5 — Hai nhóm phân tán như nhau nhưng khác trung bình. Thống kê t = (x̄₁ − x̄₂)/SE đo độ tách biệt giữa hai trung bình so với độ phân tán bên trong nhóm.</figcaption></figure>
```

### t-test ghép cặp

```definition[Thống kê $t$ ghép cặp]
Khi các quan sát đến theo cặp (cùng một mẫu đo trước và sau; hai mắt của cùng một con vật; hai kỹ thuật đo trên cùng một mẫu), đặt $d_i = x_{1i} - x_{2i}$ là các hiệu trong từng cặp và kiểm định $H_0: \mu_d = 0$ bằng thống kê một mẫu trên các hiệu:
$$t = \frac{\bar{d}}{s_d/\sqrt{n}},$$
với $n-1$ bậc tự do, trong đó $n$ là số cặp.
```

Ý tưởng: hiệu trong từng cặp loại bỏ biến thiên giữa các đơn vị (mỗi con chuột, mỗi mẫu đều có "nền" riêng), chỉ giữ lại biến thiên do xử lý. Đây là cách dùng dữ liệu hiệu quả hơn so với hai mẫu độc lập khi thiết kế cho phép ghép cặp — nhưng chỉ hợp lệ nếu các cặp thật sự tương quan (cùng đơn vị, cùng mẫu), không phải cứ gom hai nhóm vào là ghép được.

```example[Trước và sau khi xử lý]
Sáu con chuột được đo hoạt tính một enzyme (đơn vị tuỳ ý) trước và sau khi tiêm hợp chất thử. Các hiệu $d_i$ (sau − trước): $3{,}1;\; 2{,}4;\; 3{,}8;\; 2{,}9;\; 3{,}5;\; 2{,}7$. Trung bình $\bar{d} = 3{,}07$, độ lệch chuẩn $s_d = 0{,}52$. Vậy
$$t = \frac{3{,}07}{0{,}52/\sqrt{6}} = \frac{3{,}07}{0{,}212} = 14{,}5.$$
Với 5 bậc tự do, $t_{0{,}025,5} = 2{,}571$: $p \ll 0{,}001$ — hoạt tính tăng sau xử lý một cách rất có ý nghĩa. Chú ý: nếu xử lý các con chuột này như hai nhóm độc lập, biến thiên giữa các con sẽ làm nhiễu và kết quả có thể không còn ý nghĩa — ghép cặp đã loại bỏ đúng nguồn nhiễu đó.
```

### Chọn kiểm định nào?

Tóm tắt nhanh cho các tình huống thường gặp (điều kiện: dữ liệu gần chuẩn, các nhóm độc lập, phương sai không quá chênh):

- So sánh trung bình một nhóm với một giá trị quy định → **t-test một mẫu**.
- So sánh hai nhóm độc lập → **t-test hai mẫu** (Welch nếu phương sai không bằng nhau).
- So sánh hai thời điểm / hai kỹ thuật trên cùng đơn vị → **t-test ghép cặp**.
- So sánh từ ba nhóm trở lên → **ANOVA** (phần sau) — không dùng nhiều t-test lẻ.
- So sánh tỉ lệ, số đếm, bảng dự phòng → **kiểm định χ²**.
- Dữ liệu lệch mạnh hoặc mẫu rất nhỏ, không chuẩn → **kiểm định phi tham số (nonparametric tests)**: Mann–Whitney U (hai nhóm độc lập), Wilcoxon signed-rank (ghép cặp), Kruskal–Wallis (nhiều nhóm). Các kiểm định này làm việc trên thứ hạng (rank) thay vì giá trị gốc, nên không đòi hỏi phân phối chuẩn; đổi lại, chúng ít nhạy hơn khi dữ liệu thật sự chuẩn.

## ANOVA: so sánh nhiều nhóm cùng lúc

Khi có từ ba nhóm trở lên, tại sao không làm từng cặp t-test? Vì mỗi lần kiểm định ở mức $\alpha$ đều có xác suất $\alpha$ mắc sai lầm loại I; làm $m$ kiểm định độc lập, xác suất có ít nhất một kết luận sai tăng lên:
$$\alpha_{\text{eff}} = 1 - (1-\alpha)^m.$$
Với ba nhóm (ba cặp, $m=3$) và $\alpha = 0{,}05$: $\alpha_{\text{eff}} = 1 - 0{,}95^3 = 0{,}143$ — gần gấp ba mức "0,05" ta tưởng đang dùng. Hiện tượng này gọi là **lạm phát sai lầm loại I** và là lý do chính của so sánh bội (multiple comparisons) — sẽ nói thêm ở phần cạm bẫy.

```definition[Phân tích phương sai một yếu tố (one-way ANOVA)]
Với $k$ nhóm, mỗi nhóm $n_j$ quan sát, tổng cộng $N = \sum_j n_j$. Gọi $\bar{y}_j$ là trung bình nhóm $j$ và $\bar{y}$ là trung bình chung. Phân rã tổng bình phương:
$$SS_{\text{tot}} = SS_{\text{between}} + SS_{\text{within}},$$
trong đó
$$SS_{\text{between}} = \sum_{j=1}^{k} n_j(\bar{y}_j - \bar{y})^2, \qquad SS_{\text{within}} = \sum_{j=1}^{k}\sum_{i=1}^{n_j}(y_{ij} - \bar{y}_j)^2.$$
Thống kê kiểm định $H_0$: mọi trung bình nhóm bằng nhau là
$$F = \frac{SS_{\text{between}}/(k-1)}{SS_{\text{within}}/(N-k)},$$
có phân phối $F$ với $k-1$ và $N-k$ bậc tự do.
```

Diễn giải: $SS_{\text{between}}$ đo mức độ các trung bình nhóm lệch khỏi trung bình chung — "tín hiệu"; $SS_{\text{within}}$ đo độ phân tán bên trong các nhóm — "nhiễu". Tỉ số $F$ lớn nghĩa là các nhóm tách biệt so với biến thiên nội nhóm. Chia cho bậc tự do biến các tổng bình phương thành **trung bình bình phương (mean square)**, tức là "phương sai trung bình" — $MS_{\text{within}}$ chính là ước lượng gộp của $\sigma^2$ (tương tự $s_p^2$ trong t-test hai mẫu).

```example[Ba môi trường nuôi cấy]
So sánh tốc độ tăng trưởng của vi khuẩn trên ba loại môi trường, mỗi loại lặp 6 lần. Giả sử $SS_{\text{between}} = 84$ và $SS_{\text{within}} = 135$ với $k=3$, $N=18$:
$$F = \frac{84/(3-1)}{135/(18-3)} = \frac{42}{9} = 4{,}67,$$
với bậc tự do $(2, 15)$. Tra bảng $F$: giá trị tới hạn mức 0,05 là $3{,}68$; $4{,}67 > 3{,}68$, nên $p < 0{,}05$ — ít nhất hai môi trường cho tốc độ tăng trưởng khác nhau.

<figure style="margin:1.8em 0;"><img src="/img/stats/anova.svg" alt="Ba nhóm với trung bình nhóm và trung bình chung" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 6 — Ba nhóm (chấm teal): các đường đứt teal là trung bình từng nhóm ȳⱼ, đường đứt vàng là trung bình chung ȳ. F lớn khi các ȳⱼ tách khỏi ȳ (SS_giữa lớn) so với mức các điểm tách khỏi ȳⱼ (SS_trong).</figcaption></figure>
```

ANOVA cho biết *có* sự khác biệt, nhưng không cho biết *cặp nào* khác nhau. Sau khi $F$ có ý nghĩa, dùng **kiểm định hậu định (post-hoc tests)** — phổ biến là Tukey HSD (so sánh từng cặp với mức $\alpha$ đã hiệu chỉnh) hoặc Bonferroni — để xác định các cặp khác biệt mà vẫn kiểm soát sai lầm loại I tổng thể.

## Kiểm định χ²: tỉ lệ và bảng dự phòng

Khi dữ liệu là số đếm (bao nhiêu con sống, bao nhiêu mẫu dương tính, bao nhiêu hạt vàng), trung bình và $t$-test không còn phù hợp — số đếm không thể âm và có phân phối rời rạc. Công cụ chuẩn là kiểm định χ², so sánh số đếm quan sát với số đếm kỳ vọng.

```definition[Thống kê $\chi^2$]
Cho các số đếm quan sát $O_i$ và số đếm kỳ vọng $E_i$ dưới giả thuyết không,
$$\chi^2 = \sum_i \frac{(O_i - E_i)^2}{E_i}.$$
Giá trị lớn của $\chi^2$ — tức quan sát lệch xa kỳ vọng — là bằng chứng chống lại $H_0$; phân phối tham chiếu là phân phối $\chi^2$ với bậc tự do phụ thuộc vào thiết kế.
```

Từng số hạng $(O_i-E_i)^2/E_i$ đo độ lệch của mỗi ô, chuẩn hoá theo độ lớn kỳ vọng — một độ lệch 10 so với kỳ vọng 100 ($=1$) nhẹ hơn nhiều so với độ lệch 10 so với kỳ vọng 20 ($=5$). Quy tắc thực hành: các $E_i$ nên từ 5 trở lên; nếu có ô kỳ vọng nhỏ, dùng kiểm định chính xác Fisher (Fisher's exact test). Ví dụ kinh điển là thí nghiệm đậu Hà Lan của Mendel [^9]:

```example[Dữ liệu Mendel về đậu Hà Lan]
Mendel lai hai cây dị hợp về hai tính trạng và thu được 556 hạt, phân theo kiểu hình: vàng–trơn 315, vàng–nhăn 108, xanh–trơn 101, xanh–nhăn 32. Dưới giả thuyết phân li độc lập, tỉ lệ kỳ vọng là $9:3:3:1$, tức các số kỳ vọng:
$$E = (312{,}75;\; 104{,}25;\; 104{,}25;\; 34{,}75).$$
Tính từng số hạng: $\frac{(315-312{,}75)^2}{312{,}75} + \frac{(108-104{,}25)^2}{104{,}25} + \frac{(101-104{,}25)^2}{104{,}25} + \frac{(32-34{,}75)^2}{34{,}75} = 0{,}47.$
Với $k-1 = 3$ bậc tự do, giá trị tới hạn mức 0,05 là $7{,}81$. Vì $0{,}47 < 7{,}81$, dữ liệu hoàn toàn tương thích với tỉ lệ $9:3:3:1$ — $p \approx 0{,}93$. Đây chính là một trong những thí nghiệm kinh điển minh hoạ cho "không bác bỏ $H_0$" được diễn giải đúng: dữ liệu không mâu thuẫn với giả thuyết, chứ không chứng minh giả thuyết.
```

```example[Bảng dự phòng: hai công thức thuốc]
Hai công thức bào chế A và B, mỗi công thức thử trên 40 mẫu, đếm số mẫu đạt tiêu chuẩn giải phóng hoạt chất. Kết quả: A đạt 24/40, B đạt 12/40. Lập bảng $2 \times 2$ và tính số kỳ vọng dưới giả thuyết "kết quả độc lập với công thức": mỗi ô $E_{ij} = (\text{tổng hàng}_i \times \text{tổng cột}_j)/N$, chẳng hạn $E_{11} = 36 \times 40 / 80 = 18$. Khi đó
$$\chi^2 = \frac{(24-18)^2}{18} + \frac{(16-22)^2}{22} + \frac{(12-18)^2}{18} + \frac{(28-22)^2}{22} = 7{,}27.$$
Với bảng $2\times2$, bậc tự do là $(r-1)(c-1) = 1$; giá trị tới hạn mức 0,05 là $3{,}84$. $7{,}27 > 3{,}84$ nên $p < 0{,}05$: công thức A đạt tiêu chuẩn với tỉ lệ cao hơn B một cách có ý nghĩa.
```

## Tương quan và hồi quy

### Hệ số tương quan Pearson

```definition[Hệ số tương quan Pearson]
Với $n$ cặp quan sát $(x_i, y_i)$, **hệ số tương quan Pearson** là
$$r = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_i (x_i-\bar{x})^2}\;\sqrt{\sum_i (y_i-\bar{y})^2}}.$$
```

Đọc công thức: tử số là **hiệp phương sai mẫu** nhân với $n-1$ — đo mức độ hai biến "dao động cùng chiều": khi $x$ trên trung bình thì $y$ có xu hướng trên trung bình không? Mẫu số là tích hai độ lệch chuẩn, đóng vai trò chuẩn hoá: kết quả luôn nằm trong $[-1, 1]$ và không phụ thuộc đơn vị đo. $r = 1$: quan hệ tuyến tính dương hoàn hảo; $r = -1$: âm hoàn hảo; $r = 0$: không có quan hệ tuyến tính. Lưu ý hai chữ "tuyến tính": $r$ chỉ đo quan hệ *đường thẳng* — dữ liệu cong (ví dụ quan hệ bão hoà kiểu Michaelis–Menten) có thể có $r$ nhỏ dù quan hệ rất chặt.

Bình phương $r$ có diễn giải đẹp: $r^2$ là tỉ lệ phương sai của một biến được giải thích bởi quan hệ tuyến tính với biến kia. Ví dụ $r = 0{,}78$ nghĩa là $r^2 = 0{,}61$ — khoảng 61% biến thiên của biến này gắn với biến kia.

```example[Tương quan trong sinh học]
Đo khối lượng hạt và chiều cao cây con của 10 cá thể, được $r = 0{,}78$. $r^2 = 0{,}61$: 61% biến thiên chiều cao cây con giải thích được bởi khối lượng hạt qua quan hệ tuyến tính; 39% còn lại đến từ các yếu tố khác (di truyền, dinh dưỡng, sai số đo).

<figure style="margin:1.8em 0;"><img src="/img/stats/correlation.svg" alt="Bốn mức tương quan Pearson" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 7 — Bốn giá trị r trông như thế nào trên dữ liệu thật. r càng gần ±1, các điểm càng bám một đường thẳng; r = 0 chỉ nói lên "không có quan hệ tuyến tính", không nói lên "không liên quan".</figcaption></figure>
```

Tương quan không phải nhân quả — câu cảnh báo kinh điển, nhưng cần hiểu rõ vì sao. Quan sát thấy $r$ lớn có thể do: (a) $x$ gây $y$; (b) $y$ gây $x$; (c) biến thứ ba gây cả hai (ví dụ nhiệt độ tăng làm cả doanh số kem lẫn số vụ đuối nước tăng — hai biến tương quan mạnh nhưng không liên quan nhân quả); (d) tình cờ. Thống kê chỉ đo *sự đi kèm*; việc gán nhân quả phải đến từ thiết kế thí nghiệm (ngẫu nhiên hoá, đối chứng) và lý thuyết khoa học, không đến từ hệ số tương quan.

### Hồi quy tuyến tính và đường chuẩn

Khi cần dự đoán một biến từ biến kia — ví dụ suy nồng độ mẫu từ diện tích peak — dùng hồi quy.

```definition[Mô hình hồi quy tuyến tính đơn]
Mô hình giả định
$$y_i = a + b x_i + \varepsilon_i,$$
trong đó $\varepsilon_i$ là sai số ngẫu nhiên độc lập, trung bình 0, phương sai hằng số. Ước lượng $a$ và $b$ bằng **phương pháp bình phương tối thiểu (least squares)**: chọn $a, b$ cực tiểu hoá tổng bình phương sai số
$$Q(a,b) = \sum_i (y_i - a - bx_i)^2.$$
```

```proof[Nghiệm bình phương tối thiểu]
Lấy đạo hàm riêng và cho bằng 0:
$$\frac{\partial Q}{\partial b} = -2\sum_i x_i(y_i - a - bx_i) = 0, \qquad \frac{\partial Q}{\partial a} = -2\sum_i (y_i - a - bx_i) = 0.$$
Phương trình thứ hai cho $a = \bar{y} - b\bar{x}$ (đường hồi quy đi qua điểm trung bình $(\bar{x}, \bar{y})$). Thế vào phương trình thứ nhất và giải:
$$b = \frac{\sum_i (x_i-\bar{x})(y_i-\bar{y})}{\sum_i (x_i-\bar{x})^2}, \qquad a = \bar{y} - b\bar{x}.$$
```

Độ dốc $b$ đọc là: $x$ tăng 1 đơn vị thì $y$ tăng trung bình $b$ đơn vị. Chú ý hệ số $b$ có cùng tử số với hệ số tương quan $r$ — hai khái niệm cùng gốc: $r$ là phiên bản chuẩn hoá (không đơn vị), $b$ là phiên bản có đơn vị.

```definition[Hệ số xác định $R^2$]
$$R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}, \qquad SS_{\text{res}} = \sum_i (y_i - \hat{y}_i)^2, \quad SS_{\text{tot}} = \sum_i (y_i - \bar{y})^2.$$
```

$SS_{\text{tot}}$ là tổng biến thiên của $y$ quanh trung bình; $SS_{\text{res}}$ là phần biến thiên còn lại sau khi mô hình giải thích. $R^2 = 1$ nghĩa là mô hình khớp hoàn hảo; $R^2 = 0$ nghĩa là mô hình không khớp hơn việc chỉ dùng trung bình. Với hồi quy tuyến tính đơn, $R^2 = r^2$ — hai con số thống nhất.

```example[Tính tay hệ số hồi quy từ dữ liệu thô]
Bốn cặp dữ liệu $(1, 3)$, $(2, 6)$, $(3, 7)$, $(4, 10)$ — ví dụ nồng độ $x$ (µM) và tín hiệu đo $y$. **Bước 1** — trung bình:
$$\bar{x} = \frac{1+2+3+4}{4} = 2{,}5, \qquad \bar{y} = \frac{3+6+7+10}{4} = 6{,}5.$$
**Bước 2** — tích độ lệch từng điểm:
$$(-1{,}5)(-3{,}5)=5{,}25;\quad (-0{,}5)(-0{,}5)=0{,}25;\quad (0{,}5)(0{,}5)=0{,}25;\quad (1{,}5)(3{,}5)=5{,}25,$$
$$\sum (x_i-\bar{x})(y_i-\bar{y}) = 11, \qquad \sum (x_i-\bar{x})^2 = 2{,}25+0{,}25+0{,}25+2{,}25 = 5.$$
**Bước 3** — độ dốc rồi tung độ gốc:
$$b = \frac{11}{5} = 2{,}2, \qquad a = \bar{y} - b\bar{x} = 6{,}5 - 2{,}2 \times 2{,}5 = 1.$$
Đường hồi quy: $\hat{y} = 1 + 2{,}2\,x$. Kiểm tra mức khớp: $SS_{\text{tot}} = 25$, và phần dư $(-0{,}2)^2 + 0{,}6^2 + (-0{,}6)^2 + 0{,}2^2 = 0{,}8$, nên
$$R^2 = 1 - \frac{0{,}8}{25} = 0{,}968.$$
Bốn điểm gần thẳng nhưng không thẳng hoàn hảo: 96,8% biến thiên của $y$ do $x$ giải thích, 3,2% còn lại là nhiễu đo lường.
```

```example[Đường chuẩn HPLC]
Pha dãy chuẩn với nồng độ $x$ (µM) và đo diện tích peak $y$ (đơn vị tuỳ ý): dữ liệu $(0, 120)$, $(5, 10900)$, $(10, 21600)$, $(20, 43100)$, $(40, 86200)$. Bình phương tối thiểu cho đường chuẩn $y \approx 120 + 2150\,x$ (hệ số đã làm tròn từ $y = 108{,}5 + 2151{,}7\,x$), với $R^2 \approx 0{,}9999$. Một mẫu chưa biết cho diện tích $8760$; giải ngược:
$$x = \frac{8760 - 120}{2150} = 4{,}02\ \text{µM}.$$
Đây là phép suy luận ngược — và ở đây, mọi giả định của hồi quy phải được kiểm tra nghiêm túc: điểm chuẩn phải trải đều quanh vùng dự đoán, không ngoại suy ra ngoài dải chuẩn, và độ không chắc chắn của $x$ ước lượng phải được báo cáo kèm (công thức cho khoảng tin cậy của giá trị dự đoán ngược — thường gọi là khoảng "inverse prediction" — có trong mọi phần mềm thống kê chuẩn).

<figure style="margin:1.8em 0;"><img src="/img/stats/regression.svg" alt="Đường chuẩn HPLC và dự đoán ngược" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 8 — Đường chuẩn y = 120 + 2150x qua 5 điểm chuẩn. Từ diện tích peak của mẫu (chấm vàng), kẻ ngang tới đường hồi quy rồi kẻ dọc xuống trục nồng độ: x = 4,02 µM — phép suy luận ngược (inverse prediction).</figcaption></figure>
```

### Giả định và giới hạn

```remark[Các giả định của hồi quy tuyến tính]
Hồi quy tuyến tính chỉ cho kết quả tin cậy khi: (1) quan hệ giữa $x$ và $y$ thật sự tuyến tính trong dải khảo sát; (2) các quan sát độc lập; (3) phương sai của sai số không đổi theo $x$ (đồng phương sai, homoscedasticity); (4) sai số phân phối gần chuẩn (cần cho khoảng tin cậy và kiểm định). Kiểm tra bằng đồ thị phần dư (residual plot): vẽ $y_i - \hat{y}_i$ theo $\hat{y}_i$ — nếu thấy hình phễu (phương sai đổi) hay đường cong (phi tuyến), mô hình tuyến tính chưa phù hợp; có thể biến đổi dữ liệu (log, căn bậc hai) hoặc dùng mô hình khác.
```

Trong hoá phân tích, hồi quy tuyến tính còn được dùng để ước lượng **giới hạn phát hiện (limit of detection)** và **giới hạn định lượng** từ độ lệch chuẩn của phần dư và độ dốc — một ứng dụng thực tế quan trọng của việc hiểu bản chất $SS_{\text{res}}$ và $b$.

## Cạm bẫy thường gặp trong nghiên cứu hoá – sinh

**Báo cáo có chọn lọc và p-hacking.** Nếu bạn thử nhiều phép phân tích, nhiều biến phụ thuộc, hay dừng thu thập dữ liệu khi $p$ vừa đạt ý nghĩa, thì "giá trị $p$" cuối cùng không còn ý nghĩa như đã định nghĩa — vì $p$-value chỉ hợp lệ khi phân tích được quyết định trước khi nhìn dữ liệu. Thực hành lành mạnh: quyết định tiêu chí và kế hoạch phân tích trước; báo cáo mọi phép thử đã làm; tái phân tích độc lập.

**So sánh bội.** Mỗi lần kiểm định thêm làm tăng xác suất có kết luận sai. Các cách xử lý: hiệu chỉnh Bonferroni (chấp nhận $H_0$ chỉ khi $p < \alpha/m$ với $m$ là số phép thử — đơn giản, an toàn, nhưng làm giảm công suất), hoặc kiểm soát tỉ lệ phát hiện sai (false discovery rate, FDR) theo Benjamini–Hochberg [^5] — phổ biến trong dữ liệu omics (nhiều gene, nhiều metabolite cùng lúc), nơi Bonferroni quá khắt khe.

**Kích thước hiệu ứng (effect size).** $p$ nhỏ không có nghĩa hiệu ứng lớn — chỉ nghĩa là hiệu ứng được ước lượng chắc chắn. Với mẫu rất lớn, một khác biệt nhỏ đến mức vô nghĩa thực tế vẫn có $p < 0{,}001$. Ngược lại, mẫu nhỏ có thể bỏ sót hiệu ứng lớn. Báo cáo thêm kích thước hiệu ứng, ví dụ **Cohen's d** [^4]:
$$d = \frac{\bar{x}_1 - \bar{x}_2}{s_p},$$
quy ước tham khảo: $d \approx 0{,}2$ nhỏ, $0{,}5$ trung bình, $0{,}8$ lớn — cùng với khoảng tin cậy của nó.

**Công suất và cỡ mẫu.** Trước khi làm thí nghiệm, hãy ước lượng cỡ mẫu cần thiết. Với t-test hai mẫu (hai phía, cỡ mẫu bằng nhau), xấp xỉ:
$$n \ge \frac{2(z_{\alpha/2} + z_\beta)^2 \sigma^2}{\delta^2}$$
cho mỗi nhóm, trong đó $\delta$ là hiệu cần phát hiện và $z_\beta$ ứng với công suất mong muốn (ví dụ công suất 80%: $z_\beta = 0{,}84$). Công thức cho thấy ba đòn bẩy: muốn phát hiện hiệu ứng nhỏ hơn ($\delta \downarrow$), cần $n$ tăng theo bình phương; giảm $\sigma$ bằng cách kiểm soát thí nghiệm chặt hơn cũng hiệu quả tương đương. Với ước lượng chính xác hơn (dùng phân phối $t$, nhiều nhóm, thiết kế phức tạp), dùng phần mềm (G*Power, R `pwr`).

**Xử lý giá trị ngoại lai (outliers).** Không xoá ngoại lai "vì nó phá kết quả" — đó là làm sai lệch dữ liệu. Trình tự đúng: ghi chép quy trình đo để biết ngoại lai đến từ lỗi kỹ thuật (vỡ mẫu, tràn giếng) hay từ biến thiên sinh học thật; nếu nghi ngờ thống kê, dùng kiểm định khách quan như **Grubbs test** [^7]; báo cáo rõ ràng giá trị nào bị loại và lý do; và kiểm tra xem kết luận có đổi khi giữ hay bỏ giá trị đó không.

**Trình bày kết quả.** Ghi rõ $n$, dùng "trung bình ± SD" hay "± SEM" nhất quán, báo cáo khoảng tin cậy và kích thước hiệu ứng cùng với $p$, viết $p = 0{,}032$ thay vì chỉ "$p < 0{,}05$", và tránh cụm từ "không có ý nghĩa" khi thực ra là "mẫu quá nhỏ để kết luận". Nhiều tạp chí sinh học hiện khuyến khích báo cáo theo chuẩn mới [^3]: khoảng tin cậy, hiệu ứng, dữ liệu thô.

## Lộ trình học tiếp

Bài viết này mới là nền móng — mỗi phần đều có thể mở rộng thành cả một môn học. Gợi ý lộ trình:

1. **Làm lại các ví dụ bằng phần mềm.** Cài R (hoặc dùng Python với `scipy.stats` và `statsmodels`) và tái tạo từng con số trong bài — hiểu số liệu từ phần mềm sẽ ăn sâu hơn đọc lý thuyết suông. Dữ liệu của chính luận án là bài tập tốt nhất.
2. **Đọc một giáo trình hướng thực hành.** *Intuitive Biostatistics* của Harvey Motulsky [^2] giải thích khái niệm bằng trực giác, ít công thức; *Statistics for Experimenters* của Box, Hunter và Hunter [^1] dạy triết lý thiết kế thí nghiệm và phân tích dữ liệu theo cách của nhà khoa học thực nghiệm.
3. **Học thiết kế thí nghiệm.** Thống kê không cứu được một thiết kế tồi. Ngẫu nhiên hoá, lặp lại, đối chứng, khối (blocking) — những khái niệm này quyết định chất lượng dữ liệu ngay từ đầu [^1].
4. **Tiến tới các mô hình phức tạp hơn khi cần:** hồi quy bội, mô hình hỗn hợp (mixed models) cho dữ liệu lặp theo thời gian, phân tích sống còn (survival analysis) cho thí nghiệm in vivo, và các phương pháp hiệu chỉnh bội cho dữ liệu omics.
5. **Đọc lại các bài báo cùng ngành với con mắt thống kê.** Với mỗi hình có thanh lỗi, tự hỏi: SD hay SEM? Có ghi $n$ không? Có hiệu chỉnh so sánh bội không? Kết luận có dựa vào khoảng tin cậy không? Kỹ năng này biến bạn từ người đọc thành người phản biện — và sau này là người viết bài báo đàng hoàng.

Cuối cùng, một nguyên tắc bao trùm: thống kê không phải thủ tục để "chứng minh" điều bạn muốn tin, mà là ngôn ngữ để định lượng độ chắc chắn — và độ chắc chắn thường nhỏ hơn ta tưởng. Báo cáo trung thực độ không chắc chắn đó là một phần của tính chính trực khoa học, và là thứ phân biệt một kết quả đáng tin với một con số đẹp.

[^1]: George E. P. Box, J. Stuart Hunter, William G. Hunter, *Statistics for Experimenters: Design, Innovation, and Discovery*, 2nd ed., Wiley, 2005.
[^2]: Harvey Motulsky, *Intuitive Biostatistics: A Nonmathematical Guide to Statistical Thinking*, 4th ed., Oxford University Press, 2018.
[^3]: Geoff Cumming, *Understanding The New Statistics: Effect Sizes, Confidence Intervals, and Meta-Analysis*, Routledge, 2012.
[^4]: Jacob Cohen, *Statistical Power Analysis for the Behavioral Sciences*, 2nd ed., Lawrence Erlbaum Associates, 1988.
[^5]: Yoav Benjamini, Yosef Hochberg, "Controlling the false discovery rate: a practical and powerful approach to multiple testing," *Journal of the Royal Statistical Society, Series B* 57(1): 289–300, 1995.
[^6]: B. L. Welch, "The generalization of Student's problem when several different population variances are involved," *Biometrika* 34(1/2): 28–35, 1947.
[^7]: Frank E. Grubbs, "Procedures for detecting outlying observations in samples," *Technometrics* 11(1): 1–21, 1969.
[^8]: Student, "The probable error of a mean," *Biometrika* 6(1): 1–25, 1908.
[^9]: Gregor Mendel, "Versuche über Pflanzen-Hybriden," *Verhandlungen des naturforschenden Vereines in Brünn* 4: 3–47, 1866.
