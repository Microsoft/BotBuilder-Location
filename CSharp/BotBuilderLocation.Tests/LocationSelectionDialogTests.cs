namespace Microsoft.Bot.Builder.Location.Tests
{
    using System.Threading;
    using System.Threading.Tasks;
    using Builder.Dialogs;
    using Connector;
    using Dialogs;
    using Moq;
    using VisualStudio.TestTools.UnitTesting;

    [TestClass]
    public class LocationSelectionDialogTests
    {
        [TestMethod]
        public async Task If_FacebookChannel_And_NativeControlOption_Call_FacebookLocationDialog()
        {
            // Arrange
            var dialog = new LocationDialog(string.Empty, "facebook", string.Empty, LocationOptions.UseNativeControl);
            var context = new Mock<IDialogContext>(MockBehavior.Loose);

            // Act
            await dialog.StartAsync(context.Object);

            // Assert
            context.Verify(c => c.Call(It.IsAny<FacebookNativeLocationRetrieverDialog>(), It.IsAny<ResumeAfter<LocationDialogResponse>>()), Times.Once());
        }

        [TestMethod]
        public async Task If_FacebookChannel_And_NotNativeControlOption_Do_Not_Call_FacebookLocationDialog()
        {
            // Arrange
            var dialog = new LocationDialog(string.Empty, "facebook", string.Empty, LocationOptions.None);
            var context = new Mock<IDialogContext>(MockBehavior.Loose);

            context
                .Setup(c => c.MakeMessage())
                .Returns(() => new Activity());

            context
                .Setup(c => c.PostAsync(It.IsAny<IMessageActivity>(), It.IsAny<CancellationToken>()))
                .Returns(() => Task.CompletedTask);

            // Act
            await dialog.StartAsync(context.Object);

            // Assert
            context.Verify(c => c.Call(It.IsAny<FacebookNativeLocationRetrieverDialog>(), It.IsAny<ResumeAfter<LocationDialogResponse>>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Post_To_User_Passed_Prompt_When_Start_Called()
        {
            // Arrange
            string prompt = "Where do you want to ship your widget?";
            var dialog = new LocationDialog(string.Empty, "facebook", prompt, LocationOptions.None);
            var context = new Mock<IDialogContext>(MockBehavior.Loose);

            context
                .Setup(c => c.MakeMessage())
                .Returns(() => new Activity());

            context
                .Setup(c => c.PostAsync(It.IsAny<IMessageActivity>(), It.IsAny<CancellationToken>()))
                .Returns(() => Task.CompletedTask);

            // Act
            await dialog.StartAsync(context.Object);

            // Assert
            context.Verify(c => c.PostAsync(It.Is<IMessageActivity>(a => a.Text == prompt), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}