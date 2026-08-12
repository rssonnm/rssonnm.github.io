---
title: "Thống kê cơ bản cho khoa học sự sống — Phần 10: Chuỗi thời gian và biến đổi Fourier"
date: 2026-08-11T02:00:00
description: "Chín phần trước xử lý dữ liệu dạng 'một con số cho một đơn vị'. Nhưng hầu hết thiết bị hoá-sinh cho ra một cái gì đó còn giàu hơn: một dãy điểm đo liên tiếp theo thời gian hoặc theo bước sóng — phổ NMR, sắc ký đồ, quang phổ UV-Vis, điện tâm đồ. Đây là chuỗi thời gian (time series), và câu hỏi đúng không còn là 'trung bình bao nhiêu' mà là 'có những tần số nào, ở đâu trong tín hiệu'. Bài viết này xây dựng biến đổi Fourier từ gốc (chuỗi Fourier, DFT, định lý Parseval, định lý tích chập), chứng minh vì sao FID NMR tắt dần trở thành đỉnh Lorentz với độ rộng FWHM = 1/(πT2), giới hạn Nyquist và bẫy aliasing, các phép lọc (Savitzky–Golay so với trung bình động), cải thiện SNR bằng cộng dồn quét, và chuỗi thời gian thống kê (mô hình AR(1), cỡ mẫu hiệu dụng, periodogram tìm chu kỳ sinh học)."
topic: mathematics
tags: [statistics, time-series, fourier-transform, dsp, nmr, chromatography, signal-processing, tutorial]
featured: false
draft: false
---

Chín phần trước xử lý dữ liệu dạng **cắt ngang**: mỗi đơn vị (giếng, đĩa, chuột, bệnh nhân) đóng góp một hoặc vài con số, và mọi công cụ đều xoay quanh trung bình, phương sai, so sánh nhóm. Nhưng hãy nhìn vào những gì thiết bị thực sự trả về: máy NMR cho một **FID** — dao động tắt dần theo thời gian; máy sắc ký cho một dãy đỉnh theo **thời gian lưu**; máy quang phổ cho cường độ hấp thụ theo **bước sóng**; máy ghi điện tâm đồ cho điện thế theo **thời gian**. Tất cả đều là **chuỗi thời gian** (hay nói chung, chuỗi tín hiệu): một dãy điểm đo liên tiếp, tương quan với nhau.

Điểm khác biệt căn bản so với mọi phần trước: với chuỗi thời gian, câu hỏi đúng hiếm khi là *"trung bình của tín hiệu này là bao nhiêu?"* mà là *"tín hiệu này chứa những tần số nào?"* — vạch NMR ở tần số nào, đỉnh sắc ký rộng hay hẹp, nhịp sinh học có chu kỳ bao lâu. Công cụ trả lời câu hỏi đó là **biến đổi Fourier** [^1] — một trong những viên gạch toán học quan trọng nhất của khoa học thực nghiệm.

## Phần A — Tín hiệu là gì: chuỗi thời gian và tương quan

```definition[Chuỗi thời gian]
Chuỗi thời gian là một dãy quan sát được sắp thứ tự: $x_1, x_2, \ldots, x_N$, trong đó chỉ số $t$ thường là thời gian (hoặc bước sóng, tần số lưu). Khác với dữ liệu dọc của Phần 9 — vài điểm cho mỗi đơn vị, câu hỏi về xu hướng — một chuỗi thời gian thường có $N$ lớn, các điểm cách đều nhau $\Delta t$, và câu hỏi nằm ở **cấu trúc tần số** của dãy.
```

```definition[Tự tương quan (autocorrelation)]
Với chuỗi (dừng), tương quan giữa $x_t$ và $x_{t+k}$ đo bằng **hàm tự tương quan**:
$$r_k = \frac{\operatorname{Cov}(x_t, x_{t+k})}{\operatorname{Var}(x_t)} = \frac{\sum_t (x_t - \bar{x})(x_{t+k} - \bar{x})}{\sum_t (x_t - \bar{x})^2}.$$
Đây là hệ số tương quan Pearson (Phần 1) giữa chuỗi với chính nó, dịch đi $k$ bước. **Nhiễu trắng (white noise)** là chuỗi lý tưởng không có trí nhớ: $r_k = 0$ với mọi $k \neq 0$ — mỗi điểm độc lập với mọi điểm khác.
```

Một tín hiệu thực của máy đo gồm hai thành phần chồng lên nhau:

$$x_t = \underbrace{s_t}_{\text{tín hiệu thật}} + \underbrace{\varepsilon_t}_{\text{nhiễu}}.$$

Nhiễu $\varepsilon_t$ có hai họ quan trọng. **Nhiễu trắng**: phổ tần số phẳng, không tương quan — nhiễu bắn của máy đếm photon, nhiễu nhiệt của điện trở. **Nhiễu $1/f$** (nhiễu hồng): công suất tăng khi tần số giảm — đây là nhiễu **trôi (drift)**: số đo tăng dần hoặc giảm dần chậm theo thời gian, tương quan rất cao giữa các điểm gần nhau.

```remark[Trôi (drift) và dừng (stationarity)]
Một chuỗi được gọi là **dừng yếu** nếu kỳ vọng $E[x_t]$ và hàm tự tương quan $r_k$ không đổi theo $t$. Drift phá vỡ tính dừng: trung bình của tín hiệu dịch chuyển theo thời gian. Hầu hết các công cụ chuỗi thời gian (và đặc biệt là phổ) đòi hỏi xử lý drift trước — như chúng ta sẽ thấy ở cuối bài.
```

## Phần B — Biến đổi Fourier: kính hiển vi tần số

Ý tưởng cốt lõi: **mọi tín hiệu (đủ tốt) đều là tổng của các sóng hình sin với biên độ và pha khác nhau**. Nếu điều đó đúng, thì "nhìn tín hiệu" trong miền thời gian và "nhìn nó qua kính hiển vi tần số" là hai cách xem cùng một vật thể — và có những câu hỏi chỉ trả lời được ở một trong hai miền.

<figure style="margin:1.8em 0;"><img src="/img/stats/fourier-decomp.svg" alt="Tín hiệu thời gian và phổ tần số" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 1 — Một tín hiệu là tổng của hai sóng hình sin 0,8 Hz và 2,6 Hz cộng nhiễu. Trong miền thời gian (a) nó trông hỗn loạn; sau biến đổi Fourier (b) hai tần số hiện ra thành hai đỉnh sắc — đây là lý do mọi máy quang phổ và NMR đều làm việc trong miền tần số.</figcaption></figure>

### Từ chuỗi Fourier đến biến đổi liên tục

```theorem[Biến đổi Fourier]
Với tín hiệu $x(t)$ (khả tích tuyệt đối), cặp biến đổi:
$$X(f) = \int_{-\infty}^{\infty} x(t)\, e^{-2\pi i f t}\, dt, \qquad x(t) = \int_{-\infty}^{\infty} X(f)\, e^{2\pi i f t}\, df.$$
$X(f)$ là **biên độ phổ** tại tần số $f$ — nó trả lời "tín hiệu chứa bao nhiêu dao động tần số $f$". Hàm $e^{2\pi i f t} = \cos(2\pi f t) + i\sin(2\pi f t)$ là một sóng hình sin đơn vị; mọi tín hiệu là chồng chất (tích phân) của các sóng như vậy.
```

```lemma[Cặp biến đổi Gauss]
Biến đổi Fourier của một Gauss là một Gauss:
$$x(t) = \exp\!\Bigl(-\frac{t^2}{2\sigma^2}\Bigr) \quad\longleftrightarrow\quad X(f) = \sigma\sqrt{2\pi}\, \exp\!\bigl(-2\pi^2\sigma^2 f^2\bigr).$$
Hệ quả sâu sắc: **hẹp trong miền này thì rộng trong miền kia** — bề rộng thoả $\Delta t \cdot \Delta f \ge 1/(4\pi)$. Đây là "nguyên lý bất định" của tín hiệu: không thể có một xung thật ngắn mà đồng thời có phổ thật hẹp. Ta sẽ gặp lại nó ở apodization NMR.
```

### Dữ liệu rời rạc: DFT

Máy đo không cho hàm liên tục $x(t)$ — nó cho $N$ mẫu $x_n = x(n\,\Delta t)$. Với dữ liệu rời rạc, tích phân trở thành tổng:

```definition[Biến đổi Fourier rời rạc (DFT)]
Cho $N$ mẫu $x_0, \ldots, x_{N-1}$, DFT là dãy $N$ hệ số:
$$X_k = \sum_{n=0}^{N-1} x_n\, e^{-2\pi i k n / N}, \qquad k = 0, 1, \ldots, N-1.$$
Bin $k$ tương ứng tần số $f_k = \dfrac{k}{N\,\Delta t}$, và **độ phân giải tần số** là khoảng cách giữa hai bin liền kề:
$$\Delta f = \frac{1}{N\,\Delta t} = \frac{1}{T_{\text{acq}}},$$
trong đó $T_{\text{acq}} = N\,\Delta t$ là tổng thời gian thu. Vì $X_{N-k} = \overline{X_k}$ (liên hợp), nửa sau của phổ chứa cùng thông tin với nửa đầu — chỉ cần xem $k = 0, \ldots, N/2$.
```

```example[DFT bằng tay: x = (1, −1, 1, −1)]
Chuỗi $N = 4$ mẫu xen kẽ — một "sóng" có chu kỳ đúng 2 mẫu. Tính $X_k = \sum x_n e^{-2\pi i kn/4}$:
- $k = 0$ (tần số 0, thành phần một chiều): $X_0 = 1 - 1 + 1 - 1 = 0$
- $k = 1$: $X_1 = 1\cdot 1 + (-1)(-i) + 1\cdot(-1) + (-1)(i) = 1 + i - 1 - i = 0$
- $k = 2$ (tần số Nyquist): $X_2 = 1 + 1 + 1 + 1 = 4$
- $k = 3$: $X_3 = \overline{X_1} = 0$

Kết luận đẹp: sóng dao động nhanh nhất có thể (đổi dấu ở mỗi mẫu) tập trung **toàn bộ** năng lượng vào đúng bin $k = N/2$ — bin Nyquist. Đây là nền tảng để hiểu aliasing ở Phần C.
```

```theorem[Định lý Parseval — bảo toàn năng lượng]
$$\sum_{n=0}^{N-1} |x_n|^2 = \frac{1}{N} \sum_{k=0}^{N-1} |X_k|^2.$$

*Chứng minh (phác thảo).* Viết $x_n = \frac{1}{N}\sum_k X_k e^{2\pi i kn/N}$ (biến đổi ngược), thay vào vế trái:
$$\sum_n |x_n|^2 = \sum_n x_n \overline{x_n} = \frac{1}{N^2} \sum_{k,j} X_k \overline{X_j} \sum_n e^{2\pi i (k-j)n/N}.$$
Tổng trong cùng bằng $N$ khi $k = j$ và bằng 0 khi $k \neq j$ (tổng các nghiệm của đơn vị triệt tiêu) — chỉ còn các số hạng chéo biến mất, ta được $\frac{1}{N}\sum_k |X_k|^2$. $\blacksquare$

Ví dụ trên: $\sum |x_n|^2 = 1+1+1+1 = 4$ và $\frac{1}{4}(0^2+0^2+4^2+0^2) = 4$. Năng lượng của tín hiệu không đổi khi chuyển sang miền tần số — cơ sở để đo "công suất" của nhiễu ở từng tần số.
```

```theorem[Định lý tích chập]
Biến đổi Fourier biến **tích chập** thành **tích thường**:
$$\mathcal{F}[x * y](f) = X(f)\, Y(f), \qquad (x * y)(t) = \int x(u)\, y(t - u)\, du.$$

*Chứng minh (phác thảo).* $\mathcal{F}[x*y] = \iint x(u) y(t-u)\, e^{-2\pi i f t}\, dt\, du$. Đổi biến $v = t - u$: $= \int x(u) e^{-2\pi i f u} du \cdot \int y(v) e^{-2\pi i f v} dv = X(f)\,Y(f)$. $\blacksquare$

Đây là **định lý làm nên mọi phép lọc**: nhân phổ với một hàm mong muốn trong miền tần số thì tương đương với chập tín hiệu với một kernel trong miền thời gian — và ngược lại. Nó cũng là chìa khoá của deconvolution (tách dạng đỉnh thật khỏi đáp ứng máy).
```

### Ví dụ trung tâm: FID NMR trở thành đỉnh Lorentz

Không có minh hoạ nào đẹp hơn phổ NMR. Máy NMR không đo phổ trực tiếp — nó đo **FID** (free induction decay): sau xung kích thích, các hạt nhân dao động ở tần số cộng hưởng $\nu_0$ và **tắt dần theo thời gian hồi phục ngang $T_2$**:

$$x(t) = e^{-t/T_2} \cos(2\pi \nu_0 t), \qquad t \ge 0.$$

```example[Chứng minh FID → Lorentzian]
Viết $\cos(2\pi\nu_0 t) = \frac{1}{2}(e^{2\pi i\nu_0 t} + e^{-2\pi i\nu_0 t})$. Biến đổi Fourier của nhánh tắt dần, đặt $\omega = 2\pi(\nu - \nu_0)$:
$$X(\omega) = \int_0^\infty e^{-t/T_2} e^{-i\omega t}\, dt = \frac{1}{1/T_2 + i\omega} = \frac{1/T_2 - i\omega}{(1/T_2)^2 + \omega^2}.$$
Phần thực — phổ **hấp thụ** — là hàm Lorentz:
$$\operatorname{Re} X(\omega) = \frac{1/T_2}{(1/T_2)^2 + \omega^2}.$$
Tại đỉnh $\omega = 0$ giá trị là $T_2$; giá trị giảm một nửa khi $\omega = \pm 1/T_2$. Vậy **độ rộng toàn phần tại nửa chiều cao (FWHM)**:
$$\Delta\nu_{1/2} = \frac{2/T_2}{2\pi} = \frac{1}{\pi T_2}.$$

Với $T_2 = 0{,}5$ s: $\Delta\nu_{1/2} = 1/(\pi \cdot 0{,}5) = 0{,}64$ Hz. **Vạch càng rộng, $T_2$ càng ngắn** — đây chính là cách NMR đo thời gian hồi phục, và là lý do các phân tử lớn (tắt nhanh) cho vạch bè so với phân tử nhỏ.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/fid-lorentzian.svg" alt="FID tắt dần và đỉnh Lorentz" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 2 — (a) FID: dao động tắt dần với T₂ = 0,5 s. (b) Phổ thu được: hai đỉnh Lorentz cách nhau 0,8 Hz, mỗi đỉnh có FWHM = 1/(πT₂) = 0,64 Hz. Khoảng cách 0,8 Hz lớn hơn độ rộng 0,64 Hz nên hai vạch còn phân biệt được — thung lũng giữa hai đỉnh hạ xuống còn ~39% chiều cao.</figcaption></figure>

### Độ phân giải: thời gian thu quyết định mọi thứ

```example[Hai vạch cách 0,8 Hz — có tách được không?]
Từ công thức $\Delta f = 1/T_{\text{acq}}$:

- Thu $T_{\text{acq}} = 1{,}25$ s → $\Delta f = 0{,}80$ Hz: khoảng cách hai vạch đúng bằng một bin — chúng gộp thành một đỉnh, không tách được.
- Thu $T_{\text{acq}} = 2$ s → $\Delta f = 0{,}50$ Hz: hai vạch cách 0,8 Hz rơi vào hai bin khác nhau, và 0,8 Hz > FWHM 0,64 Hz nên thung lũng giữa chúng còn nhìn thấy — **phân giải được**.

Muốn tăng độ phân giải tần số, cách duy nhất là **thu lâu hơn** (tăng $T_{\text{acq}}$). "Zero-filling" — chèn số 0 vào cuối FID để có nhiều bin hơn — chỉ **nội suy** đường phổ cho mượt, không tạo ra độ phân giải mới: thông tin thật đã bị giới hạn bởi $T_{\text{acq}}$ từ đầu.
```

```example[Apodization: đánh đổi độ rộng lấy SNR]
FID thu được thường bị cắt cụt đột ngột, gây gợn phổ (leakage). Giải pháp: nhân FID với cửa sổ tắt dần $w(t) = e^{-t/\tau_{\text{ap}}}$ trước khi biến đổi — phép **apodization**. Vì nhân hai hàm mũ trong thời gian, hằng số thời gian hiệu dụng thoả:
$$\frac{1}{\tau_{\text{eff}}} = \frac{1}{T_2} + \frac{1}{\tau_{\text{ap}}}, \qquad \Delta\nu_{1/2} = \frac{1}{\pi\tau_{\text{eff}}}.$$
Với $T_2 = 0{,}5$ s và $\tau_{\text{ap}} = 0{,}25$ s: $\tau_{\text{eff}} = \dfrac{0{,}5 \times 0{,}25}{0{,}75} = 0{,}167$ s → vạch nở thành $1/(\pi \times 0{,}167) = 1{,}91$ Hz thay vì 0,64 Hz. Đổi lại, nhiễu ở đuôi FID (nơi tín hiệu đã tắt) bị dập mạnh — **SNR tăng, độ phân giải giảm**. Đây là một trong những quyết định thường trực của người chạy NMR: chọn $\tau_{\text{ap}}$ cân bằng giữa hai mục tiêu.
```

## Phần C — Lấy mẫu: giới hạn Nyquist và bẫy aliasing

```lemma[Định lý lấy mẫu Nyquist–Shannon]
Một tín hiệu chứa tần số cao nhất $f_{\max}$ **phải** được lấy mẫu với tần số $f_s = 1/\Delta t$ thoả:
$$f_s > 2\, f_{\max}.$$
Tần số $f_{\text{Nyquist}} = f_s/2$ là tần số cao nhất biểu diễn được. Mọi thành phần tần số cao hơn sẽ **ngụy trang** thành một tần số thấp hơn trong khoảng $[0, f_{\text{Nyquist}}]$ — hiện tượng **aliasing (bí danh)**.
```

```example[Aliasing: 3 Hz trông thành 1 Hz]
Lấy mẫu $x(t) = \cos(2\pi \cdot 3 t)$ với $f_s = 4$ Hz ($\Delta t = 0{,}25$ s). Các mẫu:
$$x_n = \cos\!\Bigl(2\pi \cdot 3 \cdot \frac{n}{4}\Bigr) = \cos\!\Bigl(\frac{3\pi n}{2}\Bigr).$$
Nhưng $\cos(3\pi n/2) = \cos(2\pi \cdot 1 \cdot n/4)$ — chính xác là các mẫu của sóng **1 Hz** (vì $3/4 \equiv -1/4 \pmod 1$). Sóng 3 Hz cao hơn Nyquist (2 Hz) nên xuất hiện như sóng 1 Hz giả. Không có cách nào phân biệt chúng từ các điểm mẫu — Hình 3 cho thấy đường 1 Hz đi qua đúng mọi điểm đỏ.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/aliasing.svg" alt="Aliasing: 3 Hz thành 1 Hz" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 3 — Lấy mẫu sóng 3 Hz (vàng) với 4 mẫu/giây (chấm đỏ). Ở panel (b), một sóng 1 Hz duy nhất (teal) đi qua đúng tất cả các điểm mẫu. Aliasing không phải lỗi làm tròn — nó là sự mất thông tin có hệ thống khi vi phạm Nyquist.</figcaption></figure>

```example[Nhiễu lưới điện 50 Hz trong ECG — nguy hiểm thật]
Điện tâm đồ (ECG) có băng tần quan tâm khoảng 0,5–20 Hz. Nếu lấy mẫu với $f_s = 40$ Hz (Nyquist 20 Hz), nhiễu lưới 50 Hz sẽ alias về:
$$f_{\text{alias}} = 50 - 40 = 10\ \text{Hz},$$
và 10 Hz **nằm ngay giữa băng ECG** — không còn cách nào lọc nó ra mà không phá tín hiệu. Bài học thực hành: luôn đặt bộ lọc **anti-aliasing** (thông thấp cắt ở dưới Nyquist) trước bộ chuyển đổi tương tự–số, và chọn $f_s$ cao hơn nhiều so với $2 f_{\max}$ của tín hiệu quan tâm.
```

## Phần D — Nhiễu, lọc và cải thiện SNR

```definition[Tỷ số tín/tạp và mật độ phổ công suất]
**SNR** (signal-to-noise ratio) = công suất tín hiệu / công suất nhiễu. Trong miền tần số, năng lượng của tín hiệu phân bố theo **periodogram** (ước lượng phổ công suất):
$$P_k = \frac{|X_k|^2}{N}.$$
Nhiễu trắng có $P_k$ **phẳng** ngang mọi tần số; một đỉnh sắc trong $P_k$ là dấu hiệu của thành phần tuần hoàn thật — ý tưởng này dẫn thẳng tới việc tìm chu kỳ ở Phần E.
```

```lemma[Cộng dồn quét: SNR tăng theo căn bậc hai]
Nếu lặp lại $M$ lần phép đo của cùng một tín hiệu (cộng hưởng từ: quét nhiều lần rồi cộng FID):
- Tín hiệu cộng **cùng pha**: biên độ tăng theo $M$.
- Nhiễu cộng **ngẫu pha**: phương sai tăng theo $M$, nên độ lệch chuẩn tăng theo $\sqrt{M}$.

Vậy $\text{SNR} \propto M/\sqrt{M} = \sqrt{M}$ — cùng quy luật $\sqrt{n}$ của sai số chuẩn trung bình (Phần 1): 16 lần quét → ×4, **64 lần → ×8**, 256 lần → ×16. Đây là lý do phổ NMR "đẹp" của các mẫu loãng cần hàng nghìn lần quét qua đêm: không có phép lọc nào tạo ra thông tin từ nhiễu, chỉ có cộng dồn mới làm được.
```

```example[Savitzky–Golay so với trung bình động trên đỉnh sắc ký]
Cách đơn giản nhất để làm trơn là **trung bình động** (moving average) 5 điểm: mỗi điểm thay bằng trung bình của chính nó và 4 điểm lân cận. Cách khôn ngoan hơn — **Savitzky–Golay** — khớp một đa thức bậc 2 qua 5 điểm bằng bình phương tối thiểu rồi lấy giá trị khớp tại tâm. Với cửa sổ 5, bậc 2, hệ số là:
$$\text{SG-5: } \frac{1}{35}\,(-3,\ 12,\ 17,\ 12,\ -3), \qquad \text{MA-5: } \frac{1}{5}\,(1,1,1,1,1).$$

Trên một đỉnh Gauss chuẩn hoá (σ = 0,15, bước lấy mẫu 0,05) tính được chiều cao đỉnh sau làm trơn: **MA-5 tụt còn 0,899 (mất 10%)**, **SG-5 còn 0,997 (mất 0,3%)**. Vì đa thức bậc 2 khớp tốt dạng lồi của đỉnh tại tâm, SG bảo toàn chiều cao và cả diện tích đỉnh — yếu tố quyết định cho định lượng sắc ký; MA chỉ trung bình hoá nên bẹt đỉnh và làm sai nồng độ tính ra.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/sg-vs-ma.svg" alt="Savitzky-Golay so với trung bình động" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 4 — (a) Đỉnh sắc ký + nhiễu: thô (xám), trung bình động 5 điểm (vàng), Savitzky–Golay bậc 2, 5 điểm (teal). (b) Chiều cao đỉnh sau làm trơn (không nhiễu): MA-5 bẹt 10,1%, SG-5 chỉ mất 0,3%. SG giữ được đỉnh vì nó khớp đa thức trong cửa sổ thay vì chỉ lấy trung bình.</figcaption></figure>

Phép làm trơn này — Savitzky–Golay [^3] — được công bố năm 1964 trên *Analytical Chemistry* và đến nay vẫn là công cụ mặc định của hầu hết phần mềm sắc ký.

```remark[Bộ lọc khớp (matched filter)]
Nếu biết trước dạng đỉnh (ví dụ đỉnh sắc ký gần Gauss), bộ lọc tối ưu để phát hiện nó trong nhiễu trắng là chập tín hiệu với **chính dạng đỉnh đó** — hệ quả trực tiếp của định lý tích chập: nhân phổ với phổ của đỉnh sẽ dồn năng lượng đúng chỗ đỉnh nằm. Đây là nguyên lý đằng sau "peak picking" thông minh và phép khử nhiễu trong máy khối phổ.
```

## Phần E — Chuỗi thời gian thống kê: AR(1) và tìm chu kỳ

Khi chuỗi là kết quả của một quá trình ngẫu nhiên (không phải tín hiệu xác định), ta cần mô hình xác suất cho sự phụ thuộc — họ mô hình **tự hồi quy (autoregressive)** [^6]:

```definition[Mô hình AR(1)]
Mô hình tự hồi quy bậc 1: giá trị hiện tại là một phần của giá trị trước cộng nhiễu mới:
$$x_t = c + \varphi\, x_{t-1} + \varepsilon_t, \qquad \varepsilon_t \sim N(0, \sigma^2_\varepsilon),\ \text{độc lập}.$$
Nếu $|\varphi| < 1$ chuỗi **dừng** và hàm tự tương quan rụng theo cấp số nhân: $r_k = \varphi^k$ (tự chứng minh: nhân hai vế với $x_{t-k}$ rồi lấy kỳ vọng, được $r_k = \varphi r_{k-1}$). $\varphi$ gần 1 nghĩa là chuỗi có "trí nhớ" dài — nhiễu trôi của máy đo thường có $\varphi$ rất gần 1. Trường hợp $\varphi = 1$ là **bước ngẫu nhiên (random walk)**: không dừng, phương sai tăng tuyến tính theo thời gian.
```

```lemma[Cỡ mẫu hiệu dụng của chuỗi tương quan]
Các điểm tương quan chứa ít thông tin hơn các điểm độc lập. Với AR(1) có $\varphi$:
$$n_{\text{eff}} \approx n\, \frac{1 - \varphi}{1 + \varphi}.$$

Với $\varphi = 0{,}8$: $n_{\text{eff}} \approx n/9$ — **90 điểm đo liên tiếp chỉ tương đương ~10 quan sát độc lập**. Đây chính là cùng một tư tưởng $n_{\text{eff}}$ của Phần 3 (phân phối mẫu) và Phần 8 (ICC): đừng đếm điểm, hãy đếm thông tin độc lập. Phân tích hồi quy trên chuỗi dài nhưng tương quan mạnh sẽ cho $p$-value sai lầm nhỏ một cách nguy hiểm.
```

```example[Periodogram tìm nhịp sinh học 24 giờ]
Đo hoạt động của một gen trong 96 giờ, mỗi giờ một điểm ($N = 96$, $\Delta t = 1$ h). Độ phân giải tần số:
$$\Delta f = \frac{1}{N\,\Delta t} = \frac{1}{96}\ \text{chu kỳ/giờ} \approx 0{,}0104\ \text{h}^{-1}.$$
Tần số của nhịp 24 giờ là $f = 1/24 \approx 0{,}0417\ \text{h}^{-1}$, rơi vào bin:
$$k = f \cdot N\,\Delta t = \frac{1}{24} \times 96 = 4.$$
Periodogram hiện một đỉnh sắc đúng bin $k = 4$ (Hình 5). Kiểm định ý nghĩa của đỉnh: so công suất đỉnh với phân bố của nhiễu nền (kiểm định Fisher) — một đỉnh ngẫu nhiên có thể xuất hiện khi quét nhiều tần số, đúng bài toán so sánh bội của Phần 5.
```

<figure style="margin:1.8em 0;"><img src="/img/stats/periodogram.svg" alt="Periodogram tìm chu kỳ 24 giờ" style="display:block;width:100%;max-width:620px;margin:0 auto;border:1px solid var(--line);border-radius:6px;"/><figcaption style="margin-top:.5em;font-size:.85em;color:var(--ink-soft);text-align:center;">Hình 5 — (a) 96 giờ đo hoạt động gen với nhiễu: nhìn bằng mắt thấy dao động nhưng chu kỳ chính xác là bao nhiêu? (b) Periodogram: đỉnh sắc đúng bin k = 4, tức f = 1/24 h⁻¹ — chu kỳ 24 giờ hiện ra rõ ràng. Trục ngang tới f = 0,5 h⁻¹ (Nyquist của lấy mẫu 1 giờ/lần).</figcaption></figure>

```remark[Hồi quy giả mạo trên chuỗi có trend]
Hai chuỗi ngẫu nhiên độc lập nhưng cùng tăng dần theo thời gian (ví dụ nhiệt độ phòng thí nghiệm và tốc độ phản ứng, cả hai đều trôi) sẽ cho $R^2$ cao nếu hồi quy chéo — dù chúng không liên quan gì. Đây là **hồi quy giả mạo (spurious regression)**: tương quan do trend chung, không phải do cơ chế. Biện pháp: khử trend (detrend) hoặc sai phân chuỗi trước khi phân tích, hoặc dùng mô hình có thành phần drift. Luôn hỏi: "mối quan hệ này còn đứng vững sau khi bỏ xu hướng chung không?"
```

```example[Phát hiện drift của máy đo]
Một máy đo pH trôi chậm: 60 phép đo chuẩn trong 2 giờ, mỗi phút một điểm, nhiễu trắng σ = 0,01 cùng drift tuyến tính 0,02 pH/giờ. Trung bình lăn (rolling mean) cửa sổ 10 phút sẽ cho thấy đường trôi rõ ràng so với biên độ nhiễu — nhưng trung bình lăn cũng làm trễ và che mất drift nếu cửa sổ quá dài. Chuẩn đoán chuẩn: vẽ phần dư theo thứ tự thời gian; nếu chúng có cấu trúc (tăng/giảm đều) thay vì rải quanh 0, có drift — và một phép đo "lặp lại ổn định" (SD nhỏ) vẫn có thể là phép đo **sai lệch trôi**, đúng tinh thần phân biệt độ chụm–độ đúng của Phần 1.
```

## Cạm bẫy thực hành

1. **Aliasing khi lấy mẫu quá thô.** Bất kỳ tần số nào trên Nyquist đều bị "bẻ gập" vào dải thấp và không thể phục hồi. Luôn lọc anti-aliasing trước ADC và kiểm tra $f_s \gg 2 f_{\max}$.
2. **Làm trơn quá tay.** Mỗi phép làm trơn là một phép lọc thông thấp: cửa sổ càng rộng, đỉnh càng bẹt và độ phân giải càng giảm. Kiểm tra: làm trơn một đỉnh chuẩn, đo lại chiều cao và độ rộng — nếu đổi quá vài phần trăm, cửa sổ quá lớn.
3. **Đếm điểm thay vì đếm thông tin.** 90 điểm tương quan mạnh ($\varphi = 0{,}8$) chỉ tương đương ~10 quan sát độc lập — $n_{\text{eff}} = n(1-\varphi)/(1+\varphi)$. Bỏ qua điều này làm $p$-value sai lầm nhỏ (nối thẳng bài học pseudo-replication của Phần 8 và 9).
4. **Săn đỉnh ngẫu nhiên trong periodogram.** Quét hàng trăm bin tần số là hàng trăm phép kiểm định — một số đỉnh sẽ xuất hiện do may mắn. Dùng kiểm định có hiệu chỉnh (Fisher) và đòi hỏi đỉnh phải có ý nghĩa vật lý.
5. **Zero-filling không phải phép màu.** Nó nội suy đường phổ cho mượt, không tăng độ phân giải thật — độ phân giải do $T_{\text{acq}}$ quyết định, muốn tăng phải thu lâu hơn.
6. **Hồi quy trên chuỗi có trend.** Hai chuỗi trôi độc lập cho $R^2$ cao giả tạo. Khử trend trước, hoặc diễn giải kết quả với sự thận trọng.
7. **Rò phổ (spectral leakage).** Cắt cụt tín hiệu đột ngột ở cuối cửa sổ thu tạo gợn quanh đỉnh thật. Chống bằng cửa sổ tắt dần (apodization, Hamming, Blackman) — chấp nhận đánh đổi độ rộng vạch.

## Lộ trình tiếp theo

Mười phần đã phủ từ mô tả dữ liệu đến GLM, mô hình hỗn hợp, survival và giờ là tín hiệu. Để đi sâu: (1) sách Brigham [^1] và Smith [^2] cho biến đổi Fourier và xử lý tín hiệu số ở mức thực hành; (2) *Numerical Recipes* [^7] cho FFT [^4], periodogram và lọc; (3) Chatfield [^5] và Box–Jenkins [^6] cho chuỗi thời gian thống kê (dự báo, ARIMA); (4) **biến đổi wavelet** cho tín hiệu không dừng — nơi tần số thay đổi theo thời gian (phổ NMR 2D, phân tích tín hiệu thoáng qua); (5) phân tích đa biến (PCA) trên dữ liệu phổ — nén hàng nghìn điểm đo thành vài thành phần chính, cầu nối tự nhiên sang machine learning cho hoá-sinh.

[^1]: R. N. Bracewell, *The Fourier Transform and Its Applications*, 3rd ed., McGraw-Hill, 2000.
[^2]: S. W. Smith, *The Scientist and Engineer's Guide to Digital Signal Processing*, California Technical Publishing, 1997.
[^3]: A. Savitzky and M. J. E. Golay, "Smoothing and differentiation of data by simplified least squares procedures," *Analytical Chemistry* 36(8): 1627–1639, 1964.
[^4]: J. W. Cooley and J. W. Tukey, "An algorithm for the machine calculation of complex Fourier series," *Mathematics of Computation* 19(90): 297–301, 1965.
[^5]: C. Chatfield, *The Analysis of Time Series: An Introduction*, 6th ed., Chapman & Hall/CRC, 2003.
[^6]: G. E. P. Box, G. M. Jenkins, G. C. Reinsel, and G. M. Ljung, *Time Series Analysis: Forecasting and Control*, 5th ed., Wiley, 2015.
[^7]: W. H. Press, S. A. Teukolsky, W. T. Vetterling, and B. P. Flannery, *Numerical Recipes: The Art of Scientific Computing*, 3rd ed., Cambridge University Press, 2007.
