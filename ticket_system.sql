-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2025 at 08:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ticket_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `assigned_admin` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `user_id`, `title`, `description`, `status`, `created_at`, `updated_at`, `assigned_admin`) VALUES
(133, 15, 'Дверь', 'Не открывается дверь', 'closed', '2025-02-25 05:59:01', '2025-02-25 06:21:25', 14),
(134, 28, 'Пробегал', 'Пробегал тут кабанчиком)))))', 'closed', '2025-02-25 05:59:53', '2025-02-25 06:34:02', 14),
(135, 39, 'Сама не справлюсь… зайдите ко мне на минутку 😉', 'Милый, добрый, самый умный айтишник! 🥰\r\nУ меня тут в 1С что-то сломалось… 😏\r\nЯ ж кнопочки нажимаю, а оно не работает! Ну, совсем беда… 😢\r\n\r\nНе могли бы вы зайти ко мне буквально на минуточку? 🙈\r\nЯ вам даже чай налью… ну или кофе… ну или что вы там пьёте. ☕\r\nА может, мы просто посидим, разберёмся… 😘', 'closed', '2025-02-25 06:05:22', '2025-02-25 06:34:04', 14),
(139, 39, 'Жду тебя 💋', 'СРОЧНО нужна ваша помощь!\r\nБез вас тут ну просто ничего не работает…\r\nИли… это я просто хочу вас видеть? 😘\r\n\r\nПриходите скорее, а то я тут уже волнуюсь…\r\nМожет, даже встану на каблучки, чтобы вам было приятно 😏\r\nЖду… Сгораю… Приходи* 💋', 'closed', '2025-02-25 06:14:14', '2025-02-25 06:34:05', 14),
(144, 39, 'У меня тут кнопочка заела… 😏', 'Кажется, одна важная кнопка отказывается работать… можешь прийти и помочь мне её нажать? 😘 Я бы и сама, но без тебя ничего не получается… Придётся ждать… тебя… 💋', 'closed', '2025-02-25 06:53:45', '2025-02-25 06:57:35', 14),
(145, 39, 'Срочно! Тут что-то горит! 🔥', 'У меня тут что-то горит… Ну, точнее, не у меня… но всё же! 😳 А может, это я просто загорелась желанием тебя увидеть? 😏 Приходи скорее, потуши пожар… или разожги его сильнее? 😘', 'closed', '2025-02-25 06:54:17', '2025-02-25 06:58:00', 14),
(146, 39, 'Беда! Пропала мышка! 😱', 'Я тут на столе всё обыскала – мышки нет! 😭 Или это ты решил, что я лучше буду работать без неё… и без тебя? 😏 Приди, найди, да ещё и научи меня ею правильно пользоваться… 💋', 'closed', '2025-02-25 06:54:27', '2025-02-25 06:58:00', 14),
(147, 39, ' Придётся вызвать специалиста… 😏', 'Не могу справиться сама… Придётся вызывать самого талантливого, красивого и умного специалиста… Да, это ты! 😘 Уже идёшь? Или мне ещё раз написать, чтобы ты почувствовал, как сильно тебя тут ждут? 💋\r\n\r\n', 'closed', '2025-02-25 06:54:39', '2025-02-25 06:58:01', 14),
(148, 39, 'Упс… что-то зависло! 🙈', 'Программа не отвечает… Как и ты на мои намёки 😏 Может, ты придёшь и разберёшься со всем этим? А я пока сделаю тебе кофе… или тебе нужно что-то покрепче? 😉', 'closed', '2025-02-25 06:54:49', '2025-02-25 06:58:01', 14),
(149, 39, 'Меня тут кто-то вирусит… 😘', ' В системе какой-то странный вирус… Или это ты заразил меня ожиданием? 😏 Срочно приходи, разберись, удали все лишние файлы и посмотри, как сильно я хочу, чтобы ты остался подольше… 💋', 'closed', '2025-02-25 06:55:05', '2025-02-25 06:58:27', 14),
(150, 39, 'Срочно! Нужно исправить ошибку! 😏', 'Я случайно что-то удалила… а может, это ты случайно исчез из моего поля зрения? 🙈 Приходи, спаси положение! Может, заодно и кофе попьём… или что-нибудь ещё? 😘', 'closed', '2025-02-25 06:55:18', '2025-02-25 06:59:14', 14),
(151, 39, 'Подозрительная активность в системе… 😏', 'ут что-то странное… программа ведёт себя необычно… Или это я веду себя странно, когда тебя рядом нет? 🙈 Приходи, проверь всё… А я пока подумаю, чем тебя порадовать 😘', 'closed', '2025-02-25 06:55:29', '2025-02-25 06:59:14', 14);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin','root') DEFAULT 'user',
  `position` varchar(255) DEFAULT NULL,
  `remember_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `position`, `remember_token`) VALUES
(1, 'dmitry', '$2y$10$T17bov4NnWPniexCMTkxc.MYbXuXNv24n3imoSsS4sfo553YppIui', 'user', 'Дмитрий Камень', '9dcb99af98f25f4d20814d226ce3964524cdd19952e88f5d87420870fecfc184'),
(7, 'zmei', '$2y$10$hQ7PX0caVZBixCjYFreLq.fhhBQ3gmgRHdBFxXJaP7wZqecVKuUMi', 'user', 'Змей', NULL),
(13, 'sysadmin', '$2y$10$7h1DkrUrJLzuOb6EAiMu2O/PjkEVwcIzGp8JQ6vK8LaHP0wikQPEm', 'admin', 'Сис Админ', NULL),
(14, 'admin', '$2y$10$9xN2PJJt5/SJctnCFih32OrTE4ytXLc2rQN.SXSiIBR0fdPdLlGva', 'root', 'Администратор', 'f06fa6831974e66dc5ef63863fe40e18b4c6aea0d82806f1023bc973f8423248'),
(15, 'user', '$2y$10$UiP.T523/zTqqK2Wda.ICuVU3zne8UF1Es3jCwYwMj5TqPuylcOWi', 'user', 'Бессмертный охраник Максимка', '701438ce2facf885d29359863af2af3ec83116f6d92fd9bad45e7991f3918451'),
(28, 'kaban', '$2y$10$EN6wsKX2AK6PjWrTBoS.kef/QPznYz.LEE2XHfj75uwkCDigm/uWi', 'user', 'Мега Кабан Жесткий Мощный', 'ed1db258596a03fb891f4fb00ade6d2b9551d8e44f37bb3183fd013602042afc'),
(29, 'sekrarsha', '$2y$10$KZ6o7M/xT0MN.4zhV1SU.OvrazQENr5PBUUbWVMEks3vN4ctntQcq', 'user', 'Секретарша', NULL),
(37, 'kabachok', '$2y$10$T17bov4NnWPniexCMTkxc.MYbXuXNv24n3imoSsS4sfo553YppIui', 'user', 'Кабачокен', NULL),
(39, 'mashka', '$2y$10$uegCcC5JY91XtQECcxS1ce5fQKaxcF9mOwTIQLf8IlPmU9VPtLD3a', 'user', 'Маша Бетон', '9c7317565b719306b547a95ff5d518e34ccbe70d463087e207b7e0c6234df086');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
